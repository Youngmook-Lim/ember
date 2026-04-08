const express = require('express');
const passport = require('../config/passport');

const router = express.Router();

// GET /auth/google
// Redirects the user to Google's login page.
// 'scope' tells Google what info we want access to.
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GET /auth/google/callback
// Google redirects here after the user logs in.
// Passport handles the token exchange and calls our GoogleStrategy callback.
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/?error=login_failed`
  }),
  (req, res) => {
    // Login succeeded — redirect to the dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// GET /auth/me
// Returns the currently logged-in user's info.
// The frontend calls this to check if the user is authenticated.
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
});

// POST /auth/logout
// Destroys the session and clears the cookie.
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
