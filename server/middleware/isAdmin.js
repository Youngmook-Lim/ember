// Middleware that blocks non-admin users.
// Must run after isAuthenticated so req.user is populated.
function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin === true) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

module.exports = isAdmin;
