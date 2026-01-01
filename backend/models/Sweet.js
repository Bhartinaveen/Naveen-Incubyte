const mongoose = require('mongoose');

const SweetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, default: 0 }, // MRP, used for discount calculation
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    image: { type: String },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Sweet', SweetSchema);
