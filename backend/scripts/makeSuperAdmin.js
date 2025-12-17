const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];

if (!email) {
    console.log('Current MONGODB_URI:', process.env.MONGODB_URI); // Debug log
    console.error('Please provide an email address as an argument.');
    process.exit(1);
}

const promoteToSuperAdmin = async () => {
    try {
        // Correctly handle the connection promise
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetshop');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            const allUsers = await User.find({}, 'email username');
            console.log('Available users in DB:', allUsers.map(u => `${u.username} (${u.email})`).join(', '));
            process.exit(1);
        }

        user.role = 'superadmin';
        await user.save();
        console.log(`User ${user.username} (${user.email}) is now a Super Admin.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

promoteToSuperAdmin();
