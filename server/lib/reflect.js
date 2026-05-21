const { chat } = require('./openrouter');

// Strips wrapping straight and curly quotes (one pair) and trims whitespace.
function stripWrappingQuotes(s) {
  const t = s.trim();
  const pairs = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
    ['‘', '’'],
  ];
  for (const [open, close] of pairs) {
    if (t.length >= 2 && t.startsWith(open) && t.endsWith(close)) {
      return t.slice(1, -1).trim();
    }
  }
  return t;
}

// quote:        string (required)
// source, work: string | undefined
// userQuotes:   [{ text, source, work }, ...]
// language:     'en' | 'ko'
//
// Returns: string (the reflection text). Throws on network/LLM errors.
async function reflectOnQuote({ quote, source, work, userQuotes, language }) {
  const langName = language === 'ko' ? 'natural literary Korean' : 'English';

  const system =
    'You are Ember, a warm literary companion. ' +
    'Given a quote, write a 1–3 sentence insight or interpretation — what the quote means, ' +
    'or a takeaway worth sitting with. ' +
    "You'll also receive a sample of quotes the user has already saved; use this ONLY to choose " +
    'the angle that resonates with themes they already care about. ' +
    'Do NOT reference their other quotes explicitly. ' +
    `Write in ${langName}. ` +
    'Return ONLY the reflection text — no labels, no surrounding quotation marks, no preamble.';

  const user = JSON.stringify({
    quote,
    source: source || null,
    work: work || null,
    userCollection: (userQuotes || []).map(q => ({
      text: q.text,
      source: q.source || undefined,
      work: q.work || undefined,
    })),
  });

  const raw = await chat({ system, user, temperature: 0.5 });
  const cleaned = stripWrappingQuotes(String(raw || '')).replace(/\s+/g, ' ').trim();
  return cleaned;
}

module.exports = { reflectOnQuote };
