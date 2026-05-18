const { chat } = require('./openrouter');

// candidates: [{ id, text, author, work, authorKo?, workKo? }, ...]
// userQuotes:  [{ text, source, work, pinned }, ...] (already capped by caller)
// originalQuery: string the user typed
// language: 'en' | 'ko'
// showWork: boolean (DEV only)
//
// Returns: [{ corpusQuoteId, blurb, translatedText?, reasoning? }, ...]  (up to 5)
async function personalize({ candidates, userQuotes, originalQuery, language, showWork }) {
  const system =
    'You help a user discover quotes from a curated pool that resonate with them. ' +
    'You will receive: their original query, a list of candidate quotes (with id), and a ' +
    "sample of quotes they have already saved (their taste signal). " +
    'Pick the 5 candidates that best match the query AND this user\'s taste. ' +
    'Filter near-duplicates. For each pick write a one-line blurb that connects this quote ' +
    'to the user (use the query and the user collection as cues). ' +
    (language === 'ko'
      ? 'The user wrote in Korean. Return blurbs in Korean and ALSO translate each picked quote\'s ' +
        '`text` field into natural literary Korean as `translatedText`. Use the candidate\'s `authorKo` ' +
        'or `workKo` fields in your blurb when referring to the author or work; if absent, leave names in English. '
      : 'Return blurbs in English; do not include translatedText. ') +
    (showWork
      ? 'Include a short `reasoning` field on each pick explaining why you chose it. '
      : 'Do not include any reasoning field. ') +
    'Return ONLY valid JSON in this exact shape: ' +
    '{"picks": [{"corpusQuoteId": <int>, "blurb": "<string>"' +
    (language === 'ko' ? ', "translatedText": "<korean>"' : '') +
    (showWork ? ', "reasoning": "<string>"' : '') +
    '}, ...]}';

  const user = JSON.stringify({
    originalQuery,
    language,
    candidates: candidates.map(c => ({
      id: c.id,
      text: c.text,
      author: c.author,
      work: c.work || undefined,
      authorKo: c.authorKo || undefined,
      workKo: c.workKo || undefined,
    })),
    userCollection: userQuotes.map(q => ({
      text: q.text,
      author: q.source || undefined,
      work: q.work || undefined,
      pinned: q.pinned || undefined,
    })),
  });

  const parsed = await chat({ system, user, jsonMode: true, temperature: 0.4 });
  const picks = Array.isArray(parsed?.picks) ? parsed.picks : [];
  return picks.slice(0, 5);
}

module.exports = { personalize };
