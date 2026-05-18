const fs = require('node:fs/promises');
const path = require('node:path');

const SEED_PATH = path.join(__dirname, '..', '..', '..', 'data', 'seed-quotes.json');

async function loadSeed() {
  let raw;
  try {
    raw = await fs.readFile(SEED_PATH, 'utf8');
  } catch {
    console.log('[seed] no seed file found, skipping');
    return [];
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('seed-quotes.json must be an array');
  }
  const cleaned = parsed
    .filter(q => q && typeof q.text === 'string' && q.text.trim())
    .map(q => ({
      text: q.text.trim(),
      author: (q.author || 'Unknown').trim(),
      work: q.work ? String(q.work).trim() : undefined,
      tags: Array.isArray(q.tags) ? q.tags : undefined,
      authorKoOverride: q.authorKoOverride || undefined,
      workKoOverride: q.workKoOverride || undefined,
    }));
  console.log(`[seed] loaded ${cleaned.length} quotes from seed file`);
  return cleaned;
}

module.exports = { loadSeed };
