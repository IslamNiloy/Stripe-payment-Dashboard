const express = require('express');
const router = express.Router();
const { getUserInfo } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/middlewares'); // Ensure this is the middleware for token validation

// Protected route to get user info
router.get('/user', authenticateToken, getUserInfo);

module.exports = router;
