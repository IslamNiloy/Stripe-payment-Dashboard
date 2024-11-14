const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  totalPaymentAmount: { type: Number },
  lastPaymentAmount: { type: Number },
  packageStartDate: { type: Date },
  packageEndDate: { type: Date },
  stripePaymentDetails: [
    {
      amount: { type: Number },
      status: { type: String },
      stripeCustomerId: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isSubscription: { type: Boolean, default: false }, // Indicates if the payment is for a subscription
  subscriptionId: { type: String }, // Stripe subscription ID if applicable
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
