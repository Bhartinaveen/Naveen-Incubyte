const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetshop';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const sweetRoutes = require('./routes/sweets');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Sweet Shop API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
