const Product = require('../models/product');
const Cart = require('../models/cart');

// old
// const fetchAllRender = (page, pageTitle, path, res) => {
//     Product.fetchAll()
//         .then(([rows, fieldData]) => {
//             res.render(page, {
//                 products: rows,
//                 pageTitle,
//                 path,
//             });
//         })
//         .catch(err => console.log(err));
// };

// with sequelize
const fetchAllRender = (page, pageTitle, path, res) => {
    Product.findAll()
        .then(products => {
            res.render(page, {
                products,
                pageTitle,
                path,
            });
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    fetchAllRender('shop/product-list', 'All products', '/products', res);
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(([product]) => {
            res.render('shop/product-detail', {
                product: product[0],
                pageTitle: product.title,
                path: '/products',
            });
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    // Product.findAll().then(products =>console.log(products)).catch(err => console.log(err))
    fetchAllRender('shop/index', 'Shop', '/', res);
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            console.log(products);
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts,
            });
        });
    });
};

exports.postCart = (req, res, next) => {
    const { productId } = req.body;
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
    });
    res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price);
    });
    res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
