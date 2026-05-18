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
    if (candidates.length === 0) return res.json([]);

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

    // 5. Personalize
    const showWork = process.env.DEV_SHOW_WORK === 'true';
    const picks = await personalize({
      candidates,
      userQuotes,
      originalQuery: rawQuery,
      language,
      showWork,
    });

    // 6. Validate + hydrate
    const candidateById = new Map(candidates.map(c => [c.id, c]));
    const out = [];
    for (const p of picks) {
      const id = Number(p.corpusQuoteId);
      const cand = candidateById.get(id);
      if (!cand) continue; // drop hallucinations
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
      });
    }

    const dt = Date.now() - t0;
    console.log(`[discover] userId=${req.user.id} lang=${language} candidates=${candidates.length} picks=${out.length} ${dt}ms`);
    res.json(out);
  } catch (err) {
    console.error('[discover] error', err);
    res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;
