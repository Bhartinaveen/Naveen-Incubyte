const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Sweet = require('../models/Sweet');
const auth = require('../middleware/auth');

// Create Order (Checkout)
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received Order Request:', req.body);
        const { items } = req.body; // items: [{ sweetId, quantity }]

        if (!items || items.length === 0) {
            console.error('Order Error: No items provided');
            return res.status(400).json({ message: 'No items in order' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and calculate total
        for (const item of items) {
            const sweet = await Sweet.findById(item.sweetId);
            if (!sweet) {
                console.error(`Order Error: Sweet not found ${item.sweetId}`);
                return res.status(404).json({ message: `Sweet not found: ${item.sweetId}` });
            }
            if (sweet.quantity < item.quantity) {
                console.error(`Order Error: Insufficient stock for ${sweet.name}. Requested: ${item.quantity}, Available: ${sweet.quantity}`);
                return res.status(400).json({ message: `Insufficient stock for ${sweet.name}` });
            }

            // Deduct stock
            sweet.quantity -= item.quantity;
            await sweet.save();

            orderItems.push({
                sweet: sweet._id,
                name: sweet.name,
                quantity: item.quantity,
                priceAtPurchase: sweet.price,
                costPriceAtPurchase: sweet.costPrice || 0
            });
            totalAmount += sweet.price * item.quantity;
        }

        const order = new Order({
            user: req.user.id,
            items: orderItems,
            totalAmount
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get My Orders
router.get('/myorders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get All Orders (Admin)
router.get('/admin', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) return res.status(403).json({ message: 'Admin access required' });
        const orders = await Order.find()
            .populate('user', 'username mobile')
            .populate({
                path: 'items.sweet',
                select: 'category name' // Get category and name
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update Order Status (Admin)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) return res.status(403).json({ message: 'Admin access required' });
        const { status, deliveryPartnerId } = req.body;

        const updateData = { status };
        if (deliveryPartnerId) {
            updateData.deliveryPartner = deliveryPartnerId;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Create Notification
        const Notification = require('../models/Notification');
        const notification = new Notification({
            user: order.user,
            message: `Your Order #${order._id} is now ${status.toUpperCase()}.`,
        });
        await notification.save();

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
