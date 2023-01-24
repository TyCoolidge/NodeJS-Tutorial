const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/checkout', shopController.getCheckout);

module.exports = router;
