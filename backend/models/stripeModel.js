const mongoose = require('mongoose');

const stripeSchema = new mongoose.Schema({
    stripeCustomerId: { type: String, required: true },
    appName: { type: String, required: true },
    customerDetails: {
        name: { type: String },
        email: {type: String},
        phone: { type: String },
        country: { type: String }
    },
    usage: {
        apiCalls: { type: Number, default: 0 },
        lastChargedDate: { type: Date, default: Date.now }
    },
    payments: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            amount: { type: Number },
            status: { type: String },
            createdAt: { type: Date, default: Date.now },
            customerDetails: {
                name: { type: String },
                email: {type: String},
                phone: { type: String },
                country: { type: String }
            }
        }
    ],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

module.exports = mongoose.model('StripePayment', stripeSchema);
