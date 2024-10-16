const Product = require('../models/productModel');

// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, price, appName } = req.body;
        const product = new Product({ name, price, appName });
        await product.save();
        res.status(201).json({ message: 'Product added', product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



exports.getProductsByApp = async (req, res) => {
    const { appName } = req.params;
    
    try {
      const products = await Product.find({ appName });
  
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

