const mongoose = require('mongoose');
const Sweet = require('./models/Sweet');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetshop';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB connected');
        await Sweet.deleteMany({});

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 5);
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + 3);

        await Sweet.insertMany([
            {
                name: 'Chocolate Fudge',
                category: 'Chocolate',
                price: 5.99,
                costPrice: 2.50,
                quantity: 50,
                description: 'Rich and creamy',
                expiryDate: futureDate,
                batchNumber: 'B001',
                image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&q=80'
            },
            {
                name: 'Gummy Bears',
                category: 'Gummy',
                price: 2.99,
                costPrice: 1.00,
                quantity: 100,
                description: 'Chewy fruit',
                expiryDate: futureDate,
                batchNumber: 'B002',
                image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&q=80'
            },
            {
                name: 'Old Lollipops',
                category: 'Hard Candy',
                price: 0.50,
                costPrice: 0.20,
                quantity: 10,
                description: 'Discounted',
                expiryDate: expiredDate,
                batchNumber: 'B000',
                image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=500&q=80'
            },
            {
                name: 'Fresh Macarons',
                category: 'Bakery',
                price: 12.99,
                costPrice: 6.00,
                quantity: 20,
                description: 'Delicate',
                expiryDate: warningDate,
                batchNumber: 'B003',
                image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&q=80'
            },
            {
                name: 'Licorice',
                category: 'Classic',
                price: 3.50,
                costPrice: 1.50,
                quantity: 30,
                description: 'Twists',
                expiryDate: futureDate,
                batchNumber: 'B004',
                image: 'https://images.unsplash.com/photo-1532117565882-7aa7b38d3885?w=500&q=80'
            }
        ]);

        console.log('Data Seeded');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
