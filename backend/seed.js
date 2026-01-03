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

        const Category = require('./models/Category');
        await Category.deleteMany({});
        await Category.insertMany([
            { name: 'Chocolate', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Gummy', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Hard Candy', image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Bakery', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Classic', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Dried Fruits', image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Gifting', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop' },
            { name: 'Sugar Free', image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1000&auto=format&fit=crop' }
        ]);

        console.log('Data Seeded');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
