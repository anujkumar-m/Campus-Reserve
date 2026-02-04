const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Verify Firebase Google token and create/login user
// @route   POST /api/auth/google/verify
// @access  Public
exports.verifyGoogleToken = async (req, res) => {
    try {
        const { idToken, email, name, googleId } = req.body;

        console.log('🔍 Firebase token verification for:', email);

        if (!email || !googleId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Check if user exists with this email
        let user = await User.findOne({ email });

        if (user) {
            // User exists - check if admin trying to use Google login
            if (user.role === 'admin') {
                console.log('❌ Admin attempting Google login');
                return res.status(403).json({
                    success: false,
                    message: 'Admin users must use manual login with email and password.',
                });
            }

            // Update user with Google ID if not already set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
                console.log('✅ Updated existing user with Google auth');
            }
        } else {
            // Create new user with Google auth
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                googleId,
                authProvider: 'google',
                role: 'student', // Default role, admin can change later
            });
            console.log('✅ Created new user with Google auth');
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                clubName: user.clubName,
            },
        });
    } catch (error) {
        console.error('💥 Firebase verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
