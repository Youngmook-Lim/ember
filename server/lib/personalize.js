const { chat } = require('./openrouter');

// candidates: [{ id, text, author, work, authorKo?, workKo? }, ...]
// userQuotes:  [{ text, source, work, pinned }, ...] (already capped by caller)
// originalQuery: string the user typed
// language: 'en' | 'ko'
// showWork: boolean (DEV only)
// userName: string — full display name; first name is derived as part before first space
//
// Returns:
//   { clarificationNeeded: false, intro: string, picks: [...] }
//   OR
//   { clarificationNeeded: true, clarificationMessage: string, intro: null, picks: [] }
async function personalize({ candidates, userQuotes, originalQuery, language, showWork, userName }) {
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const system =
    'You are a warm, knowledgeable literary librarian helping a user discover quotes. ' +
    'You will receive: their original query, a list of candidate quotes (with id), and a ' +
    "sample of quotes they have already saved (their taste signal). " +
    '\n\n' +
    'FIRST: Decide if the query is a meaningful request for quote recommendations. ' +
    'A valid request is any query seeking quotes, words, or passages on a topic, feeling, ' +
    'situation, or theme — even if phrased casually. ' +
    'An invalid request is something clearly unrelated: math questions, greetings alone, ' +
    'gibberish, commands to the system, questions about facts, etc. ' +
    'If you are unsure whether this is a request for quotes, lean toward asking for clarification. ' +
    '\n\n' +
    'IF the query is NOT a valid quote request: ' +
    'Return JSON with clarificationNeeded=true and a gentle clarificationMessage in the SAME LANGUAGE ' +
    'as the query, asking warmly for a quote-related rephrase. ' +
    '\n\n' +
    'IF the query IS a valid quote request: ' +
    `Address the user by their first name only: "${firstName}". ` +
    'Pick the 5 candidates that best match the query AND the user\'s taste. ' +
    'Filter near-duplicates. ' +
    'Write an intro (1–3 sentences, warm, personal) in the SAME LANGUAGE as the query. ' +
    'The intro must feel like a librarian who knows them — reference the specific theme or ' +
    'feeling they asked about, do NOT just say "here are some quotes." ' +
    'For each pick write a one-line blurb that connects this quote to the user ' +
    '(use the query and the user collection as cues). ' +
    (language === 'ko'
      ? 'The user wrote in Korean. Return blurbs in Korean and ALSO translate each picked quote\'s ' +
        '`text` field into natural literary Korean as `translatedText`. Use the candidate\'s `authorKo` ' +
        'or `workKo` fields in your blurb when referring to the author or work; if absent, leave names in English. '
      : 'Return blurbs in English; do not include translatedText. ') +
    (showWork
      ? 'Include a short `reasoning` field on each pick explaining why you chose it. '
      : 'Do not include any reasoning field. ') +
    '\n\n' +
    'Return ONLY valid JSON in EXACTLY one of these two shapes: ' +
    '\n' +
    'Shape A (valid quote request): ' +
    '{"clarificationNeeded": false, "intro": "<string>", "picks": [{"corpusQuoteId": <int>, "blurb": "<string>"' +
    (language === 'ko' ? ', "translatedText": "<korean>"' : '') +
    (showWork ? ', "reasoning": "<string>"' : '') +
    '}, ...]}' +
    '\n' +
    'Shape B (not a quote request): ' +
    '{"clarificationNeeded": true, "clarificationMessage": "<string>"}';

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

  if (parsed?.clarificationNeeded === true) {
    return {
      clarificationNeeded: true,
      clarificationMessage: parsed.clarificationMessage || '',
      intro: null,
      picks: [],
    };
  }

  // Treat missing or empty picks as a clarification signal
  const picks = Array.isArray(parsed?.picks) && parsed.picks.length > 0
    ? parsed.picks.slice(0, 5)
    : null;

  if (!picks) {
    return {
      clarificationNeeded: true,
      clarificationMessage: parsed?.clarificationMessage || '',
      intro: null,
      picks: [],
    };
  }

  return {
    clarificationNeeded: false,
    intro: parsed.intro || '',
    picks,
  };
}

module.exports = { personalize };
