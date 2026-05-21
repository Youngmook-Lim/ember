const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');
const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');
const { reflectOnQuote } = require('../lib/reflect');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
  loadExtensions: [getSqliteVecExtensionPath()],
});
const prisma = new PrismaClient({ adapter });

const router = express.Router();

const UNAVAILABLE_HTTP_STATUSES = new Set([401, 402, 429, 500, 502, 503, 504]);
const UNAVAILABLE_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT']);
function isServiceUnavailable(err) {
  if (err?.status && UNAVAILABLE_HTTP_STATUSES.has(err.status)) return true;
  if (err?.statusCode && UNAVAILABLE_HTTP_STATUSES.has(err.statusCode)) return true;
  if (err?.code && UNAVAILABLE_CODES.has(err.code)) return true;
  if (err?.message && /ECONNREFUSED|ENOTFOUND|ETIMEDOUT/.test(err.message)) return true;
  return false;
}

router.use(isAuthenticated);

// GET /api/quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// POST /api/quotes
router.post('/', async (req, res) => {
  const { text, source, work, tag, reflection, pinned, origin, corpusQuoteId } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Quote text is required' });
  }

  // Validate origin if provided
  const safeOrigin = origin === 'ai' ? 'ai' : 'user';
  let safeCorpusQuoteId = null;
  if (safeOrigin === 'ai') {
    if (typeof corpusQuoteId !== 'number' || !Number.isInteger(corpusQuoteId)) {
      return res.status(400).json({ error: 'corpusQuoteId is required for AI-origin quotes' });
    }
    const exists = await prisma.corpusQuote.findUnique({ where: { id: corpusQuoteId } });
    if (!exists) {
      return res.status(400).json({ error: 'corpusQuoteId does not reference an existing CorpusQuote' });
    }
    safeCorpusQuoteId = corpusQuoteId;
  }

  try {
    const quote = await prisma.quote.create({
      data: {
        text: text.trim(),
        source: source?.trim() || null,
        work: work?.trim() || null,
        tag: tag?.trim() || null,
        reflection: reflection?.trim() || null,
        pinned: pinned === true,
        origin: safeOrigin,
        corpusQuoteId: safeCorpusQuoteId,
        userId: req.user.id,
      },
    });
    res.status(201).json(quote);
  } catch {
    res.status(500).json({ error: 'Failed to save quote' });
  }
});

// POST /api/quotes/ai-reflect
router.post('/ai-reflect', async (req, res) => {
  const t0 = Date.now();
  const { text, source, work, language } = req.body || {};
  const trimmed = (text || '').toString().trim();
  if (!trimmed) return res.status(400).json({ error: 'Quote text is required' });
  const lang = language === 'ko' ? 'ko' : 'en';

  try {
    const recent = await prisma.quote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const pinned = await prisma.quote.findMany({
      where: { userId: req.user.id, pinned: true },
    });
    const byId = new Map();
    for (const q of [...recent, ...pinned]) byId.set(q.id, q);
    const userQuotes = Array.from(byId.values());

    const reflection = await reflectOnQuote({
      quote: trimmed,
      source: source?.toString().trim() || undefined,
      work: work?.toString().trim() || undefined,
      userQuotes,
      language: lang,
    });

    const dt = Date.now() - t0;
    console.log(`[ai-reflect] userId=${req.user.id} lang=${lang} ${dt}ms`);
    return res.json({ status: 'ok', reflection });
  } catch (err) {
    console.error('[ai-reflect] error', err);
    if (isServiceUnavailable(err)) return res.json({ status: 'unavailable' });
    return res.status(500).json({ error: 'Failed to generate reflection' });
  }
});

// PUT /api/quotes/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { text, source, work, tag, reflection, pinned } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Quote text is required' });
  }

  try {
    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.quote.update({
      where: { id },
      data: {
        text: text.trim(),
        source: source?.trim() || null,
        work: work?.trim() || null,
        tag: tag?.trim() || null,
        reflection: reflection?.trim() || null,
        pinned: pinned === true,
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// PATCH /api/quotes/:id/pin  — toggle pinned without full update
router.patch('/:id/pin', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.quote.update({
      where: { id },
      data: { pinned: !quote.pinned },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.quote.delete({ where: { id } });
    res.json({ message: 'Quote deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// GET /api/quotes/daily
router.get('/daily', async (req, res) => {
  try {
    const count = await prisma.quote.count({ where: { userId: req.user.id } });
    if (count === 0) return res.status(404).json({ error: 'No quotes saved yet' });

    const skip = Math.floor(Math.random() * count);
    const [quote] = await prisma.quote.findMany({
      where: { userId: req.user.id },
      skip,
      take: 1,
    });
    res.json(quote);
  } catch {
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

// GET /api/quotes/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(404).json({ error: 'Quote not found' });

  try {
    const quote = await prisma.quote.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

module.exports = router;
