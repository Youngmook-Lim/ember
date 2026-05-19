const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');
const { detectLanguage } = require('../lib/languageDetect');
const { embed, chat } = require('../lib/openrouter');
const { searchTopK } = require('../lib/vectorSearch');
const { personalize } = require('../lib/personalize');
const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
  loadExtensions: [getSqliteVecExtensionPath()],
});
const prisma = new PrismaClient({ adapter });

const router = express.Router();
router.use(isAuthenticated);

const TOP_K = 30;
const USER_SAMPLE_SIZE = 20;

// HTTP status codes and error codes that indicate the LLM service is unavailable
const UNAVAILABLE_HTTP_STATUSES = new Set([401, 402, 429, 500, 502, 503, 504]);
const UNAVAILABLE_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT']);

function isServiceUnavailable(err) {
  if (err?.status && UNAVAILABLE_HTTP_STATUSES.has(err.status)) return true;
  if (err?.statusCode && UNAVAILABLE_HTTP_STATUSES.has(err.statusCode)) return true;
  if (err?.code && UNAVAILABLE_CODES.has(err.code)) return true;
  // Also check for network-level errors in message
  if (err?.message && /ECONNREFUSED|ENOTFOUND|ETIMEDOUT/.test(err.message)) return true;
  return false;
}

router.post('/search', async (req, res) => {
  const t0 = Date.now();
  const rawQuery = (req.body?.query || '').toString().trim();
  if (!rawQuery) return res.status(400).json({ error: 'Query is required' });

  const language = detectLanguage(rawQuery);
  let englishQuery = rawQuery;

  try {
    // 1. Translate to English for embedding search if user wrote in Korean.
    if (language === 'ko') {
      englishQuery = await chat({
        system:
          'You translate Korean search queries to short English search queries, ' +
          'preserving intent. Return ONLY the English query, no quotes, no explanation.',
        user: rawQuery,
        temperature: 0.1,
      });
      englishQuery = String(englishQuery).trim().replace(/^["'""]+|["'""]+$/g, '');
      if (!englishQuery) englishQuery = rawQuery;
    }

    // 2. Embed and 3. Search
    const vec = await embed(englishQuery);
    const candidates = searchTopK(vec, TOP_K);
    if (candidates.length === 0) return res.json({ status: 'ok', intro: '', picks: [] });

    // 4. Load personalization context
    const recent = await prisma.quote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: USER_SAMPLE_SIZE,
    });
    const pinned = await prisma.quote.findMany({
      where: { userId: req.user.id, pinned: true },
    });
    const byId = new Map();
    for (const q of [...recent, ...pinned]) byId.set(q.id, q);
    const userQuotes = Array.from(byId.values());

    // 5. Personalize — pass userName for warm intro
    const showWork = process.env.DEV_SHOW_WORK === 'true';
    const result = await personalize({
      candidates,
      userQuotes,
      originalQuery: rawQuery, // always send original (Korean or English)
      language,
      showWork,
      userName: req.user.displayName || req.user.name || '',
    });

    // 6. Handle clarification case
    if (result.clarificationNeeded) {
      return res.json({
        status: 'clarify',
        clarificationMessage: result.clarificationMessage,
      });
    }

    // 7. Validate + hydrate picks
    const candidateById = new Map(candidates.map(c => [c.id, c]));
    const out = [];
    for (const p of result.picks) {
      const id = Number(p.corpusQuoteId);
      const cand = candidateById.get(id);
      if (!cand) continue; // drop hallucinations
      const firstTag = cand.tags ? cand.tags.split(',')[0].trim().toLowerCase() : undefined;
      out.push({
        corpusQuoteId: cand.id,
        text: cand.text,
        author: cand.author,
        work: cand.work || undefined,
        authorKo: cand.authorKo || undefined,
        workKo: cand.workKo || undefined,
        translatedText: language === 'ko' ? (p.translatedText || undefined) : undefined,
        blurb: p.blurb || '',
        reasoning: showWork ? (p.reasoning || undefined) : undefined,
        tag: firstTag || undefined,
      });
    }

    const dt = Date.now() - t0;
    console.log(`[discover] userId=${req.user.id} lang=${language} candidates=${candidates.length} picks=${out.length} ${dt}ms`);

    return res.json({ status: 'ok', intro: result.intro || '', picks: out });
  } catch (err) {
    console.error('[discover] error', err);
    if (isServiceUnavailable(err)) {
      return res.json({ status: 'unavailable' });
    }
    return res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;
