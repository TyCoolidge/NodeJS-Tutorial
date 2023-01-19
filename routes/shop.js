const path = require('path');

const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', productsController.getProducts);

module.exports = router;
