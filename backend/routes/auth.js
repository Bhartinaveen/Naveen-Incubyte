const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists' });

        // Check email too
        if (email) {
            let userByEmail = await User.findOne({ email });
            if (userByEmail) return res.status(400).json({ message: 'Email already exists' });
        }

        user = new User({
            username,
            password,
            email: email || username + "@example.com", // Fallback for now if frontend not updated immediately
            role
        });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        // Return user details including new fields
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            mobile: user.mobile,
            address: user.address
        };

        res.json({ token, role: user.role, user: userData });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update Profile
router.put('/update-profile', auth, async (req, res) => {
    try {
        const { fullName, email, mobile, address } = req.body;

        // Build update object
        const updateFields = {};
        if (fullName) updateFields.fullName = fullName;
        if (email) updateFields.email = email;
        if (mobile) updateFields.mobile = mobile;
        if (address) updateFields.address = address;

        // Check if email is being changed and if it lives
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true } // Return updated doc
        ).select('-password'); // Exclude password from return

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
