const path = require('path');

const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();

// can use same url route only for different API methods
router.get('/add-product', productsController.getAddProduct);

router.post('/add-product', productsController.postAddProduct);

module.exports = router;
// exports.routes = router;
