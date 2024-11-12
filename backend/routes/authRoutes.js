const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middlewares/middlewares'); // Assuming middleware functions are in a separate file

const router = express.Router();

// Route for admin to create a new user
router.post('/register-admin', authController.registerAdmin);

// Login
router.post('/login', authController.login);

router.post('/admin/create-user', authenticateToken, requireAdmin, authController.createUser);

// Make a user admin (admin-only route)
router.post('/admin/make-admin', authenticateToken, requireAdmin, authController.makeAdmin);

// Revoke admin privileges (admin-only route)
router.post('/admin/revoke-admin', authenticateToken, requireAdmin, authController.revokeAdmin);

// Route for regenerating an API key (admin-only)
router.post('/admin/regenerate-api-key', authenticateToken, requireAdmin, authController.regenerateApiKey);

// Route for revoking an API key (admin-only)
router.post('/admin/revoke-api-key', authenticateToken, requireAdmin, authController.revokeApiKey);

router.get('/api-keys', authenticateToken, authController.getApiKeys);



module.exports = router;
