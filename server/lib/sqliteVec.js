// Returns the absolute path to the loadable sqlite-vec binary for this OS.
// All Prisma adapter instantiations should pass this in loadExtensions so the
// vec0 virtual table type is available.
const sqliteVec = require('sqlite-vec');

function getSqliteVecExtensionPath() {
  return sqliteVec.getLoadablePath();
}

module.exports = { getSqliteVecExtensionPath };
