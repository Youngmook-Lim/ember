require('dotenv').config();  // must be first — loads .env before anything else runs

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const quotesRoutes = require('./routes/quotes');

const app = express();

// Trust the reverse proxy (Nginx Proxy Manager) so Express sees HTTPS connections
// correctly — required for secure cookies to work behind a proxy.
app.set('trust proxy', 1);

// --- Middleware ---

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

// --- Start server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
