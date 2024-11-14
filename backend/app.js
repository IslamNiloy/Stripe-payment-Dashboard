// app.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes')
const { runCronJob } = require('./cronJobs'); // Import the cron job
const userRoutes = require('./routes/userRoutes')
const appRoutes = require('./routes/appRoutes')

const app = express();

// Middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' })); 
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api',authRoutes);
app.use('/api', userRoutes);
app.use('/api', appRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // Start the cron job after MongoDB is connected
        runCronJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
