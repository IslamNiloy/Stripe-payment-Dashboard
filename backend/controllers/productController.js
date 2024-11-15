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

    // Create and save the new product with reference to the app
    const product = new Product({
      name,
      price,
      limit: productType === 'pay-as-you-go' ? null : limit, // No limit for pay-as-you-go
      productType,
      app: app._id,
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


exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find and delete the product by its ID
    const product = await Product.findByIdAndDelete({_id: productId});
    console.log()
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, limit, productType, appName } = req.body;

    // Find the app by name if appName is provided
    let app;
    if (appName) {
      app = await App.findOne({ name: appName });
      if (!app) {
        return res.status(404).json({ message: `App with name "${appName}" not found` });
      }
    }

    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product details
    product.name = name || product.name;
    product.price = price || product.price;
    product.limit = productType === 'pay-as-you-go' ? null : (limit || product.limit);
    product.productType = productType || product.productType;
    if (app) {
      product.app = app._id;
    }

    // Save the updated product
    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

