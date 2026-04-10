const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

// All quote routes require login
router.use(isAuthenticated);

// GET /api/quotes
// Returns all quotes saved by the logged-in user, newest first.
router.get('/', async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// POST /api/quotes
// Saves a new quote. Expects { text, source? } in the request body.
router.post('/', async (req, res) => {
  const { text, source } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Quote text is required' });
  }

  try {
    const quote = await prisma.quote.create({
      data: {
        text: text.trim(),
        source: source ? source.trim() : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quote' });
  }
});

// DELETE /api/quotes/:id
// Deletes a quote. Verifies the quote belongs to the logged-in user first.
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own quotes' });
    }

    await prisma.quote.delete({ where: { id } });
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// GET /api/quotes/daily
// Returns one random quote from the user's collection.
// If the user has no quotes, returns a 404.
router.get('/daily', async (req, res) => {
  try {
    const count = await prisma.quote.count({ where: { userId: req.user.id } });

    if (count === 0) {
      return res.status(404).json({ error: 'No quotes saved yet' });
    }

    // Pick a random offset and grab that one quote
    const skip = Math.floor(Math.random() * count);
    const [quote] = await prisma.quote.findMany({
      where: { userId: req.user.id },
      skip,
      take: 1,
    });

    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

module.exports = router;
