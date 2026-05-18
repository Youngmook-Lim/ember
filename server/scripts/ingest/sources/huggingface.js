// Loads Abirate/english_quotes from HuggingFace's parquet "auto-converted" mirror.
// We avoid pulling in the `parquetjs` ecosystem by using the dataset-viewer JSON
// API (rows endpoint), which is the simplest network-only path.
//
// Output shape: [{ text, author, work?, tags? }, ...]
//   - The dataset's columns are: quote (string), author (string), tags (list[str]).
//   - There is no per-quote "work" field.
const fs = require('node:fs/promises');
const path = require('node:path');

const CACHE_PATH = path.join(__dirname, '..', '..', '..', 'data', 'cache', 'huggingface.json');
const DATASET = 'Abirate/english_quotes';
const CONFIG = 'default';
const SPLIT = 'train';

async function loadHuggingFace({ useCache = true } = {}) {
  if (useCache) {
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
      console.log(`[hf] using cached ${cached.length} quotes`);
      return cached;
    } catch {
      // fall through
    }
  }

  console.log('[hf] fetching dataset rows …');
  const all = [];
  let offset = 0;
  const length = 100;
  while (true) {
    const url =
      `https://datasets-server.huggingface.co/rows` +
      `?dataset=${encodeURIComponent(DATASET)}` +
      `&config=${CONFIG}&split=${SPLIT}&offset=${offset}&length=${length}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`hf offset ${offset} HTTP ${res.status}`);
    const json = await res.json();
    const rows = json?.rows ?? [];
    if (rows.length === 0) break;
    for (const r of rows) {
      const row = r?.row ?? {};
      const text = (row.quote || '').trim().replace(/^[""]|[""]$/g, '');
      const author = (row.author || '').replace(/[,]\s*$/, '').trim() || 'Unknown';
      if (!text) continue;
      all.push({
        text,
        author,
        tags: Array.isArray(row.tags) ? row.tags : undefined,
      });
    }
    offset += rows.length;
    if (rows.length < length) break;
  }
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(all, null, 2), 'utf8');
  console.log(`[hf] fetched ${all.length} quotes`);
  return all;
}

module.exports = { loadHuggingFace };
