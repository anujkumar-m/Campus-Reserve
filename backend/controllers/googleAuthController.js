const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with same email (migration case)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Update existing user to use Google auth
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    authProvider: 'google',
                    role: 'student', // Default role, admin can change later
                });

                done(null, newUser);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Google auth error:', err);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }

        // Check if user is admin (admins cannot use Google login)
        if (user.role === 'admin') {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=admin_must_use_manual_login`);
        }

        // Generate token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            clubName: user.clubName,
        }))}`);
    })(req, res, next);
};
