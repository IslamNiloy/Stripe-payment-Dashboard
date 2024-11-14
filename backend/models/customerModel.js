const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  portalId: { type: String, unique: true, required: true }, // Unique identifier for the portal
  apps: [
    {
      app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productType: { type: String, enum: ['monthly', 'yearly', 'pay-as-you-go'], required: true },
      packagePrice: { type: Number },
      installationDate: { type: Date },
      subscriptionId: { type: String }, // Stripe subscription ID for tracking
    },
  ],
  stripeCustomerId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  isSubscribed: { type: Boolean, default: false }, // New field to indicate if the customer is subscribed
  totalApiCalls: { type: Number, default: 0 },
  monthlyApiCalls: { type: Number, default: 0 },
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
