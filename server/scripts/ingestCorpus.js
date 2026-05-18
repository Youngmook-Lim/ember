require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('node:path');

const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');
const { ensureVectorTable } = require('../lib/ensureVectorTable');
const { normalizeForDedupe } = require('../lib/textNormalize');
const { loadQuotable } = require('./ingest/sources/quotable');
const { loadHuggingFace } = require('./ingest/sources/huggingface');
const { loadSeed } = require('./ingest/sources/seed');
const { resolveAuthorKo, resolveWorkKo, clearCache } = require('./ingest/resolveKoreanNames');
const { embedAll } = require('./ingest/embedBatch');

function dbPathFromEnv() {
  const url = process.env.DATABASE_URL || '';
  // DATABASE_URL is "file:./prisma/data/dev.db" — strip the file: prefix
  return url.replace(/^file:/, '');
}

async function tryLoad(name, fn) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[ingest] source "${name}" failed: ${err.message}. Continuing without it.`);
    return [];
  }
}

async function main() {
  const t0 = Date.now();

  // Make sure the virtual table exists (idempotent).
  ensureVectorTable();

  // 1. Load all sources — resilient to individual source failures.
  const [quotable, hf, seed] = await Promise.all([
    tryLoad('quotable', () => loadQuotable()),
    tryLoad('huggingface', () => loadHuggingFace()),
    tryLoad('seed', () => loadSeed()),
  ]);
  const sourced = [
    ...quotable.map(q => ({ ...q, sourceFeed: 'quotable' })),
    ...hf.map(q => ({ ...q, sourceFeed: 'huggingface' })),
    ...seed.map(q => ({ ...q, sourceFeed: 'seed' })),
  ];
  console.log(`[ingest] loaded ${sourced.length} from all sources`);
  if (sourced.length === 0) {
    console.error('[ingest] no quotes loaded from any source; aborting');
    process.exit(1);
  }

  // 2. Normalize + 3. Dedup
  const seen = new Map();
  for (const q of sourced) {
    const text = String(q.text).trim();
    if (!text) continue;
    const author = (q.author || 'Unknown').trim() || 'Unknown';
    const work = q.work ? String(q.work).trim() : null;
    const normalized = normalizeForDedupe(text);
    if (!normalized) continue;
    if (seen.has(normalized)) continue; // keep earliest
    seen.set(normalized, {
      text,
      author,
      work,
      tags: Array.isArray(q.tags) && q.tags.length ? JSON.stringify(q.tags) : null,
      sourceFeed: q.sourceFeed,
      normalizedText: normalized,
      authorKoOverride: q.authorKoOverride,
      workKoOverride: q.workKoOverride,
    });
  }
  const deduped = Array.from(seen.values());
  console.log(`[ingest] deduped to ${deduped.length} unique quotes (dropped ${sourced.length - deduped.length})`);

  // 4. Resolve Korean labels (TEMPORARILY SKIPPED for first ingest run; will be backfilled later)
  console.log('[ingest] SKIPPING Korean label resolution for initial seed run');
  for (const q of deduped) {
    q.authorKo = q.authorKoOverride || null;
    q.workKo = q.workKoOverride || null;
  }

  // 5. Wipe + rebuild
  const db = new Database(dbPathFromEnv());
  db.loadExtension(getSqliteVecExtensionPath());
  db.pragma('journal_mode = WAL');
  db.exec('DELETE FROM CorpusQuoteEmbedding;');
  db.exec('DELETE FROM CorpusQuote;');

  const insert = db.prepare(`
    INSERT INTO CorpusQuote (text, author, work, tags, sourceFeed, normalizedText, authorKo, workKo, createdAt)
    VALUES (@text, @author, @work, @tags, @sourceFeed, @normalizedText, @authorKo, @workKo, datetime('now'))
  `);
  const insertEmbedding = db.prepare(`
    INSERT INTO CorpusQuoteEmbedding (rowid, embedding) VALUES (?, ?)
  `);

  const inserted = [];
  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      const { authorKoOverride, workKoOverride, ...payload } = r;
      const info = insert.run(payload);
      // lastInsertRowid is BigInt in better-sqlite3 v12; sqlite-vec vec0 requires BigInt rowid values
      inserted.push({ id: BigInt(info.lastInsertRowid), text: r.text });
    }
  });
  insertMany(deduped);
  console.log(`[ingest] inserted ${inserted.length} CorpusQuote rows`);

  // 5b. Embed and insert into the virtual table
  const vectors = await embedAll(inserted.map(r => r.text));
  const embedTx = db.transaction(() => {
    for (let i = 0; i < inserted.length; i++) {
      insertEmbedding.run(inserted[i].id, Buffer.from(new Float32Array(vectors[i]).buffer));
    }
  });
  embedTx();
  console.log(`[ingest] inserted ${inserted.length} embeddings`);

  // 6. Log summary
  const krAuthorHits = deduped.filter(q => q.authorKo).length;
  const krWorkHits = deduped.filter(q => q.workKo).length;
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[ingest] DONE in ${dt}s. quotable=${quotable.length} hf=${hf.length} seed=${seed.length} ` +
              `total=${sourced.length} unique=${deduped.length} authorsKo=${krAuthorHits} worksKo=${krWorkHits}`);

  db.close();
}

main().catch(err => {
  console.error('[ingest] FAILED:', err);
  process.exitCode = 1;
});
