// Loads all quotes from quotable.io via its paginated /quotes endpoint.
// Caches the assembled list under server/data/cache/quotable.json.
//
// Output shape: [{ text, author, work?, tags? }, ...]
//   - quotable doesn't expose a "work" field, so we omit it.
//   - quotable's "tags" are short topical labels we pass through.
const fs = require('node:fs/promises');
const path = require('node:path');

const CACHE_PATH = path.join(__dirname, '..', '..', '..', 'data', 'cache', 'quotable.json');

async function loadQuotable({ useCache = true } = {}) {
  if (useCache) {
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
      console.log(`[quotable] using cached ${cached.length} quotes`);
      return cached;
    } catch {
      // fall through to fetch
    }
  }

  console.log('[quotable] fetching all quotes via API …');
  const all = [];
  let page = 1;
  const limit = 150;
  while (true) {
    const res = await fetch(`https://api.quotable.io/quotes?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`quotable page ${page} HTTP ${res.status}`);
    const json = await res.json();
    const results = json?.results ?? [];
    for (const q of results) {
      if (!q.content || !q.author) continue;
      all.push({
        text: q.content,
        author: q.author,
        tags: Array.isArray(q.tags) ? q.tags : undefined,
      });
    }
    const totalPages = json?.totalPages ?? 1;
    if (page >= totalPages) break;
    page += 1;
  }
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(all, null, 2), 'utf8');
  console.log(`[quotable] fetched ${all.length} quotes`);
  return all;
}

module.exports = { loadQuotable };
