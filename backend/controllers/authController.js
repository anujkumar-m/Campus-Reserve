const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department, clubName } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
            clubName,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔍 Login attempt:', { email, passwordLength: password?.length });

        // Validate email & password
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check for user (include password)
        const user = await User.findOne({ email }).select('+password');
        console.log('👤 User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Only admins can use manual login
        if (user.role !== 'admin') {
            console.log('❌ Non-admin attempting manual login');
            return res.status(403).json({
                success: false,
                message: 'Please use Google Sign-In to login. Manual login is only available for administrators.',
            });
        }

        // Ensure user is using local auth provider
        if (user.authProvider !== 'local') {
            console.log('❌ Admin user configured for Google auth');
            return res.status(403).json({
                success: false,
                message: 'This account is configured for Google Sign-In',
            });
        }

        console.log('🔐 Comparing password...');
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        console.log('✅ Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password does not match');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('🎉 Login successful for:', user.email);

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
        console.error('💥 Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
