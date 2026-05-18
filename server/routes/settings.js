const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');
const { logger } = require('../config/logger');
const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
  loadExtensions: [getSqliteVecExtensionPath()],
});
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.use(isAuthenticated);

const VALID_THEMES = ['warm', 'night', 'paper'];

function computeStreak(dates) {
  const dateSet = new Set(dates);
  let count = 0;
  const cursor = new Date();
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function computeWeekDays(dates) {
  const dateSet = new Set(dates);
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    week.push(dateSet.has(d.toISOString().slice(0, 10)) ? 1 : 0);
  }
  return week;
}

// GET /api/settings
// Returns the user's settings. Creates a record with defaults on first access.
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    });
    res.json({ theme: settings.theme });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PATCH /api/settings
// Updates one or more settings fields.
router.patch('/', async (req, res) => {
  const { theme } = req.body;
  const data = {};
  if (theme !== undefined) {
    if (!VALID_THEMES.includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme value' });
    }
    data.theme = theme;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.json({ theme: settings.theme });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/visits
// Records today's visit (idempotent). Returns current streak + weekDays.
router.post('/visits', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    await prisma.visit.upsert({
      where: { userId_date: { userId: req.user.id, date: today } },
      update: {},
      create: { userId: req.user.id, date: today },
    });

    const visits = await prisma.visit.findMany({
      where: { userId: req.user.id },
      select: { date: true },
    });
    const dates = visits.map(v => v.date);

    res.json({
      streak: computeStreak(dates),
      weekDays: computeWeekDays(dates),
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

module.exports = router;
