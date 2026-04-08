require('dotenv').config();  // must be first — loads .env before anything else runs

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Session middleware — must come before passport
// Reads the session cookie, loads the session from SQLite
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './prisma' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,   // cookie not accessible via JavaScript (XSS protection)
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week in milliseconds
  }
}));

// Passport middleware — must come after session
app.use(passport.initialize());  // sets up passport on the request object
app.use(passport.session());     // calls deserializeUser on every request

// --- Routes ---

app.use('/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Meaningful Quotes API is running',
    timestamp: new Date().toISOString()
  });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
