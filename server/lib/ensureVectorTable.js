// Idempotently ensures the sqlite-vec virtual table exists. Called from server
// startup and from the ingest script, since Prisma's migration engine (a Rust
// binary) cannot load the sqlite-vec extension and therefore cannot create
// virtual tables backed by it. This helper uses better-sqlite3 directly, where
// we can load the extension.
const Database = require('better-sqlite3');
const path = require('node:path');
const { getSqliteVecExtensionPath } = require('./sqliteVec');

function ensureVectorTable() {
  const url = process.env.DATABASE_URL || '';
  const file = url.replace(/^file:/, '');
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  const db = new Database(abs);
  try {
    db.loadExtension(getSqliteVecExtensionPath());
    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS "CorpusQuoteEmbedding" USING vec0(embedding float[1536]);`);
  } finally {
    db.close();
  }
}

module.exports = { ensureVectorTable };
