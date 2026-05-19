const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');
const { getSqliteVecExtensionPath } = require('../lib/sqliteVec');
const { logger } = require('../config/logger');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
  loadExtensions: [getSqliteVecExtensionPath()],
});
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.use(isAuthenticated);
router.use(isAdmin);

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalUsers,
      newUsersThisWeek,
      usersWithQuotes,
      totalQuotes,
      newQuotesThisWeek,
      aiQuotes,
      quotesWithReflections,
      pinnedQuotes,
      totalCorpus,
      topTags,
      activeVisitsThisWeek,
      openFeedback,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { quotes: { some: {} } } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.quote.count({ where: { origin: 'ai' } }),
      prisma.quote.count({ where: { reflection: { not: null } } }),
      prisma.quote.count({ where: { pinned: true } }),
      prisma.corpusQuote.count(),
      prisma.quote.groupBy({
        by: ['tag'],
        where: { tag: { not: null } },
        _count: { tag: true },
        orderBy: { _count: { tag: 'desc' } },
        take: 10,
      }),
      prisma.visit.groupBy({
        by: ['userId'],
        where: { date: { gte: weekAgo.toISOString().slice(0, 10) } },
      }).then(rows => rows.length),
      prisma.feedback.count({ where: { status: 'new' } }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        withZeroQuotes: totalUsers - usersWithQuotes,
      },
      quotes: {
        total: totalQuotes,
        newThisWeek: newQuotesThisWeek,
        aiOrigin: aiQuotes,
        userOrigin: totalQuotes - aiQuotes,
        withReflections: quotesWithReflections,
        pinned: pinnedQuotes,
      },
      corpus: {
        total: totalCorpus,
      },
      tags: topTags.map(r => ({ tag: r.tag, count: r._count.tag })),
      visits: {
        activeUsersThisWeek: activeVisitsThisWeek,
      },
      feedback: {
        openCount: openFeedback,
      },
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
