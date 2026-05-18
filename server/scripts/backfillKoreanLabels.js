require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('node:path');

const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');
const { resolveAuthorKo, resolveWorkKo, clearCache } = require('./ingest/resolveKoreanNames');

function dbPathFromEnv() {
  const url = process.env.DATABASE_URL || '';
  // DATABASE_URL is "file:./prisma/data/dev.db" — strip the file: prefix
  return url.replace(/^file:/, '');
}

async function main() {
  const t0 = Date.now();
  const db = new Database(dbPathFromEnv());
  db.loadExtension(getSqliteVecExtensionPath());

  // Find all rows that still need a Korean label.
  const rows = db.prepare(`
    SELECT id, author, work, authorKo, workKo
      FROM CorpusQuote
     WHERE authorKo IS NULL OR (work IS NOT NULL AND workKo IS NULL)
  `).all();

  console.log(`[backfill] ${rows.length} rows need Korean labels`);
  clearCache();

  const updateStmt = db.prepare(`UPDATE CorpusQuote SET authorKo = ?, workKo = ? WHERE id = ?`);

  let authorHits = 0;
  let workHits = 0;
  let processed = 0;

  for (const r of rows) {
    let authorKo = r.authorKo;
    let workKo = r.workKo;
    if (authorKo == null) {
      authorKo = await resolveAuthorKo(r.author);
      if (authorKo) authorHits += 1;
    }
    if (r.work && workKo == null) {
      workKo = await resolveWorkKo(r.work, r.author);
      if (workKo) workHits += 1;
    }
    updateStmt.run(authorKo, workKo, r.id);
    processed += 1;
    if (processed % 50 === 0) {
      console.log(`[backfill] ${processed}/${rows.length} (author hits: ${authorHits}, work hits: ${workHits})`);
    }
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[backfill] DONE in ${dt}s. processed=${processed} authorKoHits=${authorHits} workKoHits=${workHits}`);
  db.close();
}

main().catch(err => {
  console.error('[backfill] FAILED:', err);
  process.exitCode = 1;
});
