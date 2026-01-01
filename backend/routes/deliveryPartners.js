const express = require('express');
const router = express.Router();
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Generate Unique ID Helper
const generateUniqueId = async () => {
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
        // Generate DP-XXXXX
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        uniqueId = `DP-${randomNum}`;
        const existing = await DeliveryPartner.findOne({ uniqueId });
        if (!existing) isUnique = true;
    }
    return uniqueId;
};

// @route   POST /api/delivery-partners/admin/add
// @desc    Add a new delivery partner
// @access  Admin Only (Protected by check in frontend/middleware logic, repeated here)
router.post('/admin/add', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { name, mobile } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({ message: 'Name and Mobile are required' });
        }

        const uniqueId = await generateUniqueId();

        const newPartner = new DeliveryPartner({
            name,
            mobile,
            uniqueId,
            status: 'active'
        });

        await newPartner.save();
        res.status(201).json(newPartner);
    } catch (err) {
        console.error('Error adding delivery partner:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/delivery-partners/admin/all
// @desc    Get all delivery partners
// @access  Admin Only
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
        const count = await DeliveryPartner.countDocuments();

        res.json({ partners, count });
    } catch (err) {
        console.error('Error fetching delivery partners:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/delivery-partners/admin/terminate/:id
// @desc    Terminate a delivery partner
// @access  Admin Only
router.put('/admin/terminate/:id', auth, async (req, res) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: 'Delivery Partner not found' });
        }

        partner.status = 'terminated';
        await partner.save();

        res.json({ message: 'Delivery Partner terminated', partner });
    } catch (err) {
        console.error('Error terminating delivery partner:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/delivery-partners/login
// @desc    Login for Delivery Partner
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { name, uniqueId } = req.body;

        if (!name || !uniqueId) {
            return res.status(400).json({ message: 'Please provide Name and Unique ID' });
        }

        // Case insensitive search for name might be good, but strict for now
        const partner = await DeliveryPartner.findOne({
            name: name, // Exact match for now
            uniqueId: uniqueId
        });

        if (!partner) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (partner.status === 'terminated') {
            return res.status(403).json({ message: 'Your ID has been terminated. Please contact admin.' });
        }

        // Create a special token for partner
        // Using a different structure or secret could separate them, but reusing structure with role='partner' is easiest
        const payload = {
            id: partner._id,
            role: 'partner',
            name: partner.name,
            uniqueId: partner.uniqueId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

        res.json({ token, partner });
    } catch (err) {
        console.error('Partner login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/delivery-partners/me
// @desc    Get current partner info and their records (assigned orders)
// @access  Partner Protected
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        if (decoded.role !== 'partner') return res.status(403).json({ message: 'Not a partner token' });

        const partnerId = decoded.id;
        const partner = await DeliveryPartner.findById(partnerId);

        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        // Get orders assigned to this partner
        // Note: 'deliveryPartner' field needs to be added to Order model
        const orders = await Order.find({ deliveryPartner: partnerId })
            .populate('user', 'username mobile address')
            .sort({ createdAt: -1 });

        res.json({ partner, orders });
    } catch (err) {
        console.error('Error fetching partner data:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/delivery-partners/accept-order/:orderId
// @desc    Partner accepts an order -> Status to 'shipped' -> Notify User
// @access  Partner Protected
router.put('/accept-order/:orderId', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ message: 'No token' });
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

        if (decoded.role !== 'partner') return res.status(403).json({ message: 'Not a partner' });

        const order = await Order.findOne({
            _id: req.params.orderId,
            deliveryPartner: decoded.id
        });

        if (!order) return res.status(404).json({ message: 'Order not found or not assigned to you' });

        if (order.status !== 'assigned') {
            return res.status(400).json({ message: 'Order is not in assigned state' });
        }

        order.status = 'shipped';
        await order.save();

        // Create Notification for User
        const Notification = require('../models/Notification');
        // Simple message, can be improved
        const notification = new Notification({
            user: order.user,
            message: `Your Order #${order._id.toString().slice(-6).toUpperCase()} has been SHIPPED by ${decoded.name}.`
        });
        await notification.save();

        res.json({ message: 'Order accepted and shipped', order });
    } catch (err) {
        console.error('Accept order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
