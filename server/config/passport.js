const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// serializeUser: called when a session is created after login.
// Decides what to store in the session — we only store the user's ID,
// not the whole user object (keeps sessions small).
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser: called on every request where a session exists.
// Takes the ID stored in the session and fetches the full user from the DB.
// This is what populates req.user.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GoogleStrategy: teaches Passport how to handle Google OAuth.
// This callback runs after Google redirects back to your app.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if this Google user already has an account
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // If not, create one automatically (first-time login)
        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
        }

        // Pass the user to Passport — it will create a session
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
