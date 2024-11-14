const Product = require('../models/productModel');
const App = require('../models/appModel');

// Updated addProduct Controller
exports.addProduct = async (req, res) => {
  try {
    const { name, price, limit, productType, appName } = req.body;

    // Check if the app exists
    const app = await App.findOne({ name: appName });
    if (!app) {
      return res.status(404).json({ message: `App with name "${appName}" does not exist` });
    }

    // Check for duplicate product name within the same app
    const existingProduct = await Product.findOne({ name, app: app._id });
    if (existingProduct) {
      return res.status(400).json({ message: `Product with name "${name}" already exists in app "${appName}"` });
    }

    // Calculate expireDate based on productType
    let expireDate = null;
    if (productType === 'monthly') {
      expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30); // Set expire date to 30 days from today
    } else if (productType === 'yearly') {
      expireDate = new Date();
      expireDate.setFullYear(expireDate.getFullYear() + 1); // Set expire date to 365 days from today
    }

    // Create and save the new product with reference to the app
    const product = new Product({
      name,
      price,
      limit: productType === 'pay-as-you-go' ? null : limit, // No limit for pay-as-you-go
      expireDate,
      productType,
      app: app._id
    });
    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.getProductsByApp = async (req, res) => {
  const { appName } = req.params;

  try {
    // Find the app by name to get its ObjectId
    const app = await App.findOne({ name: appName });
    if (!app) {
      return res.status(404).json({ message: `App with name "${appName}" not found` });
    }

    // Find products using the app's ObjectId
    const products = await Product.find({ app: app._id });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this app' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};



// Fetch distinct app names from the products
exports.getAppNames = async (req, res) => {
  try {
    const appNames = await Product.distinct('appName'); // Get distinct appName values
    res.status(200).json(appNames); // Send the list of app names
  } catch (error) {
    console.error('Error fetching app names:', error);
    res.status(500).json({ error: 'Failed to fetch app names' });
  }
};

