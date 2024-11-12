// controllers/appController.js
const App = require('../models/appModel');

// Controller to create a new app
exports.createApp = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Create and save the new app with the creator's ID
    const newApp = new App({
      name,
      description,
      createdBy: req.user.id // Assuming req.user.id contains the authenticated user's ID
    });
    await newApp.save();
    res.status(201).json({ message: 'App created successfully', app: newApp });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ message: 'App with this name already exists' });
    } else {
      console.error('Error creating app:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
// Controller to get all apps
exports.getAllApps = async (req, res) => {
    try {
      const apps = await App.find()
        .select('name description createdAt createdBy')
        .populate('createdBy', 'name email'); // Populate creator's name and email from the User model
      res.json(apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  