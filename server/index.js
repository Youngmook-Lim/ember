require('dotenv').config();  // must be first — loads .env before anything else runs

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const quotesRoutes = require('./routes/quotes');
const settingsRoutes = require('./routes/settings');
const feedbackRoutes = require('./routes/feedback');
const discoverRoutes = require('./routes/discover');
const { logger, morganStream } = require('./config/logger');
const { ensureVectorTable } = require('./lib/ensureVectorTable');

const app = express();

// Trust the reverse proxy (Nginx Proxy Manager) so Express sees HTTPS connections
// correctly — required for secure cookies to work behind a proxy.
app.set('trust proxy', 1);

// --- Middleware ---

app.use(morgan('combined', { stream: morganStream }));

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Session middleware — must come before passport
// Reads the session cookie, loads the session from SQLite
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './prisma/data' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',   // HTTPS-only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false,
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week in milliseconds
  }
}));

// Passport middleware — must come after session
app.use(passport.initialize());  // sets up passport on the request object
app.use(passport.session());     // calls deserializeUser on every request

// --- Routes ---

app.use('/auth', authRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/discover', discoverRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Ember API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve the built React frontend in production.
// Must come after all API routes so /api/* and /auth/* are matched first.
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Catch-all: any URL that didn't match an API route gets the React app.
// React Router then handles the routing on the client side.
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// --- Ensure sqlite-vec virtual table exists ---
// Prisma's Rust schema-engine cannot load the sqlite-vec JS extension, so the
// virtual table cannot be created inside a migration. We create it here
// idempotently on every startup instead.
try {
  ensureVectorTable();
  logger.info('[startup] CorpusQuoteEmbedding virtual table ready');
} catch (err) {
  logger.error('[startup] ensureVectorTable failed (Discover search will not work):', err.message);
}

// --- Start server ---
const PORT = process.env.PORT || 3000;

app.use((err, _req, res, _next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
