// Returns "ko" if the string contains any Hangul character, else "en".
// This is intentionally simple — we only need to distinguish our two supported
// query languages. If Korean and English are mixed (e.g. names left in Latin
// inside a Korean phrase), we still treat the query as Korean.
const HANGUL_RE = /[가-힯ᄀ-ᇿ㄰-㆏]/;

function detectLanguage(text) {
  if (typeof text !== 'string') return 'en';
  return HANGUL_RE.test(text) ? 'ko' : 'en';
}

module.exports = { detectLanguage };
