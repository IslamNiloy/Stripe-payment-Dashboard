const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Register the first admin
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // If not, proceed to create the new admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role: 'admin' });
        await user.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'An error occurred during registration', error });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ token });
};

// Promote a user to admin (admin-only route)
exports.makeAdmin = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'admin';
    await user.save();
    res.json({ message: `User ${email} has been promoted to admin` });
};

// Revoke admin privileges (admin-only route)
exports.revokeAdmin = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'user';
    await user.save();
    res.json({ message: `Admin privileges for ${email} have been revoked` });
};


exports.createUser = async (req, res) => {
    const { email, password, role = 'user' } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: `User created successfully with role: ${role}` });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'An error occurred while creating the user', error });
    }
};


exports.regenerateApiKey = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new API key
        user.apiKey = crypto.randomBytes(32).toString('hex');
        await user.save();

        res.json({ message: 'API key regenerated', apiKey: user.apiKey });
    } catch (error) {
        console.error('Error regenerating API key:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.revokeApiKey = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set API key to null or remove it
        user.apiKey = null;
        await user.save();

        res.json({ message: 'API key revoked' });
    } catch (error) {
        console.error('Error revoking API key:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getApiKeys = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            // Admins can see all users' API keys
            const users = await User.find({}, 'name email apiKey'); // Select specific fields
            res.json(users);
        } else {
            // Regular users can only see their own API key
            const user = await User.findById(req.user.id, 'name email apiKey');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ name: user.name, email: user.email, apiKey: user.apiKey });
        }
    } catch (error) {
        console.error('Error retrieving API keys:', error);
        res.status(500).json({ message: 'An error occurred while retrieving API keys', error });
    }
};