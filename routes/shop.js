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

router.get('/checkout', shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getOrder);

router.get('/checkout/cancel', shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
