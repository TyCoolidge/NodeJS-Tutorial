const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// this needs to be above dynamic route otherwise /products/:productId would read first
// using next() would fix this issue
// router.get('/products/delete');

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
