const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        sweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sweet',
            required: true
        },
        name: String, // Snapshot of name
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
        costPriceAtPurchase: { type: Number, required: true, default: 0 }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
