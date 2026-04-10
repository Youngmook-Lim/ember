// Middleware that blocks unauthenticated requests.
// Passport sets req.isAuthenticated() based on whether a valid session exists.
// Use this on any route that requires login.
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'You must be logged in to do that' });
}

module.exports = isAuthenticated;
