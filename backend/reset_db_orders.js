const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const resetOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const Order = require('./models/Order');
        await Order.deleteMany({});
        console.log('All orders have been deleted.');

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetOrders();
