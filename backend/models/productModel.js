// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  limit: { type: Number }, // API call or other usage limits
  expireDate: { type: Date },
  productType: { type: String, enum: ['monthly', 'yearly', 'pay-as-you-go'], required: true },
  createdAt: { type: Date, default: Date.now },
  app: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true } // Reference to App model
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
