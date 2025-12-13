const mongoose = require('mongoose');

const SweetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    image: { type: String }
});

module.exports = mongoose.model('Sweet', SweetSchema);
