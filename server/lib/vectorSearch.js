const Database = require('better-sqlite3');
const path = require('node:path');
const { getSqliteVecExtensionPath } = require('./sqliteVec');

let _db = null;
function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL || '';
  const file = url.replace(/^file:/, '');
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  _db = new Database(abs, { readonly: true, fileMustExist: true });
  _db.loadExtension(getSqliteVecExtensionPath());
  return _db;
}

// embedding: number[] of length 1536
// limit: integer
// Returns: [{ id, text, author, work, authorKo, workKo, tags, distance }, ...]
function searchTopK(embedding, limit = 30) {
  const buf = Buffer.from(new Float32Array(embedding).buffer);
  const rows = getDb().prepare(`
    SELECT q.id, q.text, q.author, q.work, q.authorKo, q.workKo, q.tags, e.distance
      FROM CorpusQuoteEmbedding e
      JOIN CorpusQuote q ON q.id = e.rowid
     WHERE e.embedding MATCH ?
       AND k = ?
     ORDER BY e.distance
  `).all(buf, limit);
  return rows;
}

module.exports = { searchTopK };
