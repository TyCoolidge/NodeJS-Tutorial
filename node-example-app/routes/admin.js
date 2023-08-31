const path = require('path');

const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const productValidatorMiddleware = [
    body('title', 'Please enter a title')
        .trim()
        .not()
        .isEmpty()
        .isString()
        .isLength({ min: 3, max: 50 })
        .withMessage('Title must be at least 3 chars and max 50 chars'),
    // body('imageUrl').isURL().withMessage('Please enter a valid URL link'),
    body('price').isCurrency().withMessage('Please enter a valid price'),
    body('description')
        .trim()
        .isLength({ min: 3, max: 400 })
        .withMessage(
            'Please enter a valid Product desctription with a least 3 characters and max 400 characters long.'
        ),
];
// middleware
router.use(isAuth);
// can use same url route only for different API methods
// /admin/add-product => GET
// request travels from left -> right
router.get('/add-product', adminController.getAddProduct);
// /admin/add-product => POST
router.post('/add-product', productValidatorMiddleware, adminController.postAddProduct);

// /admin/products => GET
router.get('/products', adminController.getAdminProducts);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', productValidatorMiddleware, adminController.postEditProduct);

router.delete('/product/:productId', adminController.deleteProducts);

module.exports = router;
// exports.routes = router;
