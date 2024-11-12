// userController.js
const User = require('../models/userModel'); // Adjust the path to your User model

// Controller to get user details
exports.getUserInfo = (req, res) => {
    try {
      const userId = req.user.id; // Make sure req.user is defined and contains an id
      // Retrieve user information based on userId
      // Assume you have a User model
      User.findById(userId)
        .then(user => {
          if (!user) return res.status(404).json({ message: 'User not found' });
          res.json({ user });
        })
        .catch(error => res.status(500).json({ message: 'Error fetching user info', error }));
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: 'Error fetching user info', error });
    }
  };
