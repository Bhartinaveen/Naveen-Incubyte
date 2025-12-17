const express = require('express');
const router = express.Router();
const Sweet = require('../models/Sweet');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Add new sweet (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { name, category, price, costPrice, quantity, description, image, expiryDate, batchNumber } = req.body;
        const newSweet = new Sweet({ name, category, price, costPrice, quantity, description, image, expiryDate, batchNumber });
        await newSweet.save();
        res.status(201).json(newSweet);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all sweets
router.get('/', async (req, res) => {
    try {
        const sweets = await Sweet.find();
        res.json(sweets);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Search sweets
// Search sweets with filters
router.get('/search', async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice } = req.query;
        let dbQuery = {};

        if (query) {
            dbQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            dbQuery.category = category;
        }

        if (minPrice || maxPrice) {
            dbQuery.price = {};
            if (minPrice) dbQuery.price.$gte = Number(minPrice);
            if (maxPrice) dbQuery.price.$lte = Number(maxPrice);
        }

        const sweets = await Sweet.find(dbQuery);
        res.json(sweets);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get single sweet
router.get('/:id', async (req, res) => {
    try {
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
        res.json(sweet);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get reviews for a sweet
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ sweet: req.params.id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add review
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

        const review = new Review({
            sweet: sweet._id,
            user: req.user.id,
            username: req.user.username || 'Anonymous', // In a real app we'd populate user to get name, or store it in token
            rating,
            comment
        });

        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update sweet (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedSweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSweet);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete sweet (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) return res.status(403).json({ message: 'Admin access required' });
        await Sweet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sweet deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Purchase sweet (Inventory)
router.post('/:id/purchase', auth, async (req, res) => {
    try {
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
        if (sweet.quantity <= 0) return res.status(400).json({ message: 'Out of stock' });

        sweet.quantity -= 1;
        await sweet.save();
        res.json(sweet);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Restock sweet (Admin only)
router.post('/:id/restock', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) return res.status(403).json({ message: 'Admin access required' });
        const { quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Invalid quantity' });

        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

        sweet.quantity += quantity;
        await sweet.save();
        res.json(sweet);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
