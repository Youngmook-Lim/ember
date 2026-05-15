const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');
const { logger } = require('../config/logger');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

const VALID_TYPES = ['bug', 'suggestion', 'other'];
const VALID_STATUSES = ['new', 'reviewed', 'done', 'dismissed'];
const MAX_MESSAGE_LEN = 5000;

router.use(isAuthenticated);

// POST /api/feedback — any logged-in user
router.post('/', async (req, res) => {
  const { type, message, replyOk, page, locale } = req.body || {};

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: 'Message too long' });
  }

  try {
    const created = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        type,
        message: message.trim(),
        replyOk: replyOk === true,
        page: typeof page === 'string' ? page.slice(0, 200) : null,
        locale: typeof locale === 'string' ? locale.slice(0, 16) : null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// All routes below require admin
router.use(isAdmin);

// GET /api/feedback — admin only, newest first, joined with submitter
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(items);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// PATCH /api/feedback/:id — admin only, update status
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const updated = await prisma.feedback.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// DELETE /api/feedback/:id — admin only, hard delete
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    await prisma.feedback.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;
