const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware to check if user is superadmin
const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied. Super Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/users
// @desc    Get all users
// @access  Super Admin
router.get('/', auth, isSuperAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Super Admin
router.put('/:id/role', auth, isSuperAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
