const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// this needs to be above dynamic route otherwise /products/:productId would read first
// using next() would fix this issue
// router.get('/products/delete');

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

module.exports = router;
