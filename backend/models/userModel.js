const mongoose = require('mongoose');
const crypto = require('crypto'); // For generating API keys

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    apiKey: { type: String, unique: true } // Unique API key for each user
});

// Generate a new API key before saving a new user
userSchema.pre('save', function (next) {
    if (!this.apiKey) {
        this.apiKey = crypto.randomBytes(32).toString('hex');
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
