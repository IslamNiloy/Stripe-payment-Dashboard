// routes/appRoutes.js
const express = require('express');
const router = express.Router();
const { createApp, getAllApps } = require('../controllers/appController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Ensure this middleware authenticates the token

// Route to create a new app (accessible to authenticated users)
router.post('/apps', authenticateToken, createApp);

// Route to get all apps (accessible to all authenticated users)
router.get('/apps', authenticateToken, getAllApps);

module.exports = router;
