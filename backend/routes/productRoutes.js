const express = require('express');
const router = express.Router();
const { addProduct, getAppNames,getProductsByApp } = require('../controllers/productController');

router.post('/', addProduct);
router.get('/app/:appName/products', getProductsByApp);
router.get('/apps', getAppNames);

module.exports = router;
