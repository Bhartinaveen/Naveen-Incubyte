const mongoose = require('mongoose');
const Sweet = require('./models/Sweet');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetshop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Connected to DB');
        const sweets = await Sweet.find({});
        console.log('--- CURRENT SWEETS IN DB ---');
        sweets.forEach(s => {
            console.log(`ID: ${s._id} | Name: ${s.name}`);
        });
        console.log('----------------------------');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
