const User = require('../models/userModel'); // Ensure the path to your User model is correct

// Middleware to validate API key
async function validateApiKey(req, res, next) {
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
        return res.status(403).json({ message: 'API key is required' });
    }

    try {
        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(403).json({ message: 'Invalid API key' });
        }

        // Attach user data to the request object for further use
        req.user = user;
        next();
    } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = validateApiKey;

