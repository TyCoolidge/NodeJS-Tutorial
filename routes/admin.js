const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// can use same url route only for different API methods
// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getAdminProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProducts);

module.exports = router;
// exports.routes = router;
