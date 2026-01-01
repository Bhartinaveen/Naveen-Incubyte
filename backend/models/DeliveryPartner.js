const mongoose = require('mongoose');

const DeliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uniqueId: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true // Assuming mobile is needed for contact
    },
    status: {
        type: String,
        enum: ['active', 'terminated'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
