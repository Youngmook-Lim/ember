const { koLabelForEntity } = require('../../lib/wikidataLookup');
const { chat } = require('../../lib/openrouter');

// In-process cache for a single ingest run.
const authorCache = new Map();
const workCache = new Map();

function clearCache() {
  authorCache.clear();
  workCache.clear();
}

async function resolveAuthorKo(author) {
  if (!author || author === 'Unknown') return null;
  if (authorCache.has(author)) return authorCache.get(author);
  let label = await koLabelForEntity(author);
  if (!label) label = await llmFallback(`Author: ${author}`);
  authorCache.set(author, label);
  return label;
}

async function resolveWorkKo(work, author) {
  if (!work) return null;
  const key = `${author || ''}|${work}`;
  if (workCache.has(key)) return workCache.get(key);
  const searchTerm = author ? `${work} ${author}` : work;
  let label = await koLabelForEntity(searchTerm);
  if (!label) label = await llmFallback(`Title: ${work} by ${author || 'unknown author'}`);
  workCache.set(key, label);
  return label;
}

async function llmFallback(prompt) {
  try {
    const reply = await chat({
      system:
        'You translate proper names of authors and book titles into the widely-accepted Korean rendering. ' +
        'If a Korean edition of a book exists, use its published title. If a name has a standard Korean ' +
        'transliteration, use it. Reply with ONLY the Korean text, no explanation, no quotes. If you are ' +
        'not confident the Korean form is widely accepted, reply with exactly the word UNKNOWN.',
      user: `Provide the Korean rendering for: ${prompt}`,
      temperature: 0.1,
    });
    const trimmed = String(reply).trim().replace(/^["'""]+|["'""]+$/g, '');
    if (!trimmed || trimmed === 'UNKNOWN') return null;
    if (!/[가-힯]/.test(trimmed)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

module.exports = { resolveAuthorKo, resolveWorkKo, clearCache };
