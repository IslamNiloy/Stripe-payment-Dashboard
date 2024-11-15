const express = require('express');
const router = express.Router();
const { addProduct, getAppNames,getProductsByApp, deleteProduct, updateProduct } = require('../controllers/productController');

router.post('/create-product', addProduct);
router.get('/app/:appName/products', getProductsByApp);
router.get('/apps', getAppNames);
router.delete("/delete/:productId", deleteProduct);
router.put("/update/:productId", updateProduct);

module.exports = router;
