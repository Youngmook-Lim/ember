// Looks up the Korean label of an entity matching `searchTerm` on Wikidata.
// Strategy:
//   1. Search entities with action=wbsearchentities&language=en.
//   2. Take the top hit's id (e.g. Q9358 for Friedrich Nietzsche).
//   3. Fetch the entity with action=wbgetentities&props=labels&languages=ko.
//   4. Return labels.ko.value, or null if missing.
//
// Returns null on any failure (network, no hit, no Korean label). Callers
// should fall back to the LLM resolver.

const API = 'https://www.wikidata.org/w/api.php';

async function koLabelForEntity(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') return null;
  try {
    const searchUrl =
      `${API}?action=wbsearchentities` +
      `&search=${encodeURIComponent(searchTerm)}` +
      `&language=en&format=json&limit=1&origin=*`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'EmberDiscover/1.0' } });
    if (!searchRes.ok) return null;
    const searchJson = await searchRes.json();
    const id = searchJson?.search?.[0]?.id;
    if (!id) return null;

    const entityUrl =
      `${API}?action=wbgetentities` +
      `&ids=${id}&props=labels&languages=ko` +
      `&format=json&origin=*`;
    const entRes = await fetch(entityUrl, { headers: { 'User-Agent': 'EmberDiscover/1.0' } });
    if (!entRes.ok) return null;
    const entJson = await entRes.json();
    const label = entJson?.entities?.[id]?.labels?.ko?.value;
    return typeof label === 'string' && label.length > 0 ? label : null;
  } catch {
    return null;
  }
}

module.exports = { koLabelForEntity };
