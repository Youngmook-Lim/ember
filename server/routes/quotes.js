const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

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
  const { text, source, work, tag, reflection, pinned } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Quote text is required' });
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
        userId: req.user.id,
      },
    });
    res.status(201).json(quote);
  } catch {
    res.status(500).json({ error: 'Failed to save quote' });
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

module.exports = router;
