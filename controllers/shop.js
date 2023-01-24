const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            products,
            pageTitle: 'All products',
            path: '/products',
        });
    });
    // by joining (this will work for all OS, ex: Windows uses \)
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    // res.send('<h1>Hello from Express</h1>'); // sends response, DOES not go to next middleware
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/index', {
            products,
            pageTitle: 'Shop',
            path: '/',
        });
    });
};

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
