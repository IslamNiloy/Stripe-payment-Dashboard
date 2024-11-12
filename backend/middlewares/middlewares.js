const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import the User model

// Middleware to verify JWT token
// middlewares/middlewares.js

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract the token from the "Authorization" header
  if (!token) return res.status(403).json({ message: 'Access denied' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = decoded; // Set the decoded payload to req.user
    next();
  });
}

module.exports = { authenticateToken };


// Middleware to check for admin role
async function requireAdmin(req, res, next) {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') return res.sendStatus(403);
    next();
}

module.exports = { authenticateToken, requireAdmin };
