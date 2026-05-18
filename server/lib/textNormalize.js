// Produces a canonical key for dedup comparisons.
// Same input → same output, deterministic.
//
// Rules:
//   1. Unicode-normalize to NFKC (composes compatible characters).
//   2. Replace curly quotes/dashes with ASCII equivalents.
//   3. Lowercase.
//   4. Collapse all whitespace runs to a single space; trim ends.
//   5. Strip leading/trailing punctuation.
function normalizeForDedupe(input) {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFKC');
  s = s
    .replace(/[''‚‛]/g, "'")
    .replace(/[""„‟]/g, '"')
    .replace(/[–—―]/g, '-')
    .replace(/…/g, '...');
  s = s.toLowerCase();
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '');
  return s;
}

module.exports = { normalizeForDedupe };
