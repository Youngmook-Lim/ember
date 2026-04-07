const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create the Express app
const app = express();

// --- Middleware ---
// Parse JSON request bodies (so we can read req.body on POST/PUT requests)
app.use(express.json());

// Allow requests from the React frontend (different port during development)
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default dev server port
  credentials: true                // allow cookies (needed for sessions later)
}));

// --- Routes ---

// Health check — a simple route to verify the server is running
// This is the first thing you test when setting up any backend
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Meaningful Quotes API is running',
    timestamp: new Date().toISOString()
  });
});

// --- Start the server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
