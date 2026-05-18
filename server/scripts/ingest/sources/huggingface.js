// Loads Abirate/english_quotes from HuggingFace's parquet "auto-converted" mirror.
// We avoid pulling in the `parquetjs` ecosystem by using the dataset-viewer JSON
// API (rows endpoint), which is the simplest network-only path.
//
// Output shape: [{ text, author, work?, tags? }, ...]
//   - The dataset's columns are: quote (string), author (string), tags (list[str]).
//   - There is no per-quote "work" field.
const fs = require('node:fs/promises');
const path = require('node:path');

// The Abirate/english_quotes dataset has mojibake: UTF-8 bytes were decoded as
// CP1252, so smart quotes (â€™ → ') and accented letters (Ã« → ë) are garbled.
// Fix: walk char-by-char, and whenever a CP1252 char looks like a multi-byte
// UTF-8 sequence start, try to decode that sequence. Falls back per-char if not.
// U+FFFD in the data means CP1252 byte 0x9D (undefined in CP1252 → HuggingFace
// replaced it), which is the UTF-8 3rd byte for right double quote (U+201D).
const _CP1252_TO_BYTE = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A],
  [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92],
  [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C],
  [0xFFFD, 0x9D], [0x017E, 0x9E], [0x0178, 0x9F],
]);

function _cp1252Byte(cp) {
  return cp <= 0xFF ? cp : (_CP1252_TO_BYTE.get(cp) ?? null);
}

function fixMojibake(str) {
  if (!str) return str;
  let result = '';
  let i = 0;
  while (i < str.length) {
    const byte1 = _cp1252Byte(str.charCodeAt(i));
    if (byte1 !== null && byte1 >= 0xC0) {
      const seqLen = byte1 >= 0xF0 ? 4 : byte1 >= 0xE0 ? 3 : 2;
      if (i + seqLen <= str.length) {
        const bytes = [byte1];
        let valid = true;
        for (let j = 1; j < seqLen; j++) {
          const cb = _cp1252Byte(str.charCodeAt(i + j));
          if (cb === null || cb < 0x80 || cb > 0xBF) { valid = false; break; }
          bytes.push(cb);
        }
        if (valid) {
          const decoded = Buffer.from(bytes).toString('utf8');
          if (!decoded.includes('�')) { result += decoded; i += seqLen; continue; }
        }
      }
    }
    result += str[i++];
  }
  return result;
}

const CACHE_PATH = path.join(__dirname, '..', '..', '..', 'data', 'cache', 'huggingface.json');
const DATASET = 'Abirate/english_quotes';
const CONFIG = 'default';
const SPLIT = 'train';

async function loadHuggingFace({ useCache = true } = {}) {
  if (useCache) {
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
      console.log(`[hf] using cached ${cached.length} quotes`);
      return cached.map(q => ({ ...q, text: fixMojibake(q.text), author: fixMojibake(q.author) }));
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
      const text = fixMojibake((row.quote || '').trim().replace(/^[""]|[""]$/g, ''));
      const author = fixMojibake((row.author || '').replace(/[,]\s*$/, '').trim() || 'Unknown');
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
