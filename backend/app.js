// app.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customerRoutes = require('./routes/customerRoutes');
const { runCronJob } = require('./cronJobs'); // Import the cron job

const app = express();

// Middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' })); 
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connected');

        // Start the cron job after MongoDB is connected
        runCronJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
