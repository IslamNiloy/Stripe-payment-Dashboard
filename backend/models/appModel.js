// models/appModel.js
const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the User model
});

const App = mongoose.model('App', appSchema);
module.exports = App;
