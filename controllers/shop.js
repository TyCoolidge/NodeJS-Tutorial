const Product = require('../models/product');
const Order = require('../models/order');

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
const fetchAllRender = async (page, pageTitle, path, req, res) => {
    try {
        const products = await Product.find();
        res.render(page, {
            products,
            pageTitle,
            path,
            // isAuthenticated: req.session.isLoggedIn,
            // csrfToken: req.csrfToken(),
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.getProducts = (req, res, next) => {
    fetchAllRender('shop/product-list', 'All products', '/products', req, res);
};

exports.getProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
    // FIND ALL Syntax sequelize
    // console.log(
    //     Product.findAll({ where: { id: productId } })
    //         .then(prod => prod)
    //         .catch(err => console.log(err))
    // );
};

exports.getIndex = (req, res, next) => {
    console.log('index');
    // Product.findAll().then(products =>console.log(products)).catch(err => console.log(err))
    fetchAllRender('shop/index', 'Shop', '/', req, res);
};

exports.getCart = async (req, res, next) => {
    // console.log(req.user.cart);
    try {
        const userObj = await req.user.populate('cart.items.productId');
        const cartProducts = userObj.cart.items;
        console.log({ cartProducts });
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: cartProducts,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }

    // Cart.getCart(cart => {
    //     Product.fetchAll(products => {
    //         const cartProducts = [];
    //         for (product of products) {
    //             const cartProductData = cart.products.find(prod => prod.id === product.id);
    //             if (cartProductData) {
    //                 cartProducts.push({ productData: product, qty: cartProductData.qty });
    //             }
    //         }
    //         res.render('shop/cart', {
    //             path: '/cart',
    //             pageTitle: 'Your Cart',
    //             products: cartProducts,
    //         });
    //     });
    // });
};

exports.postCart = async (req, res, next) => {
    const { productId } = req.body;
    try {
        const product = await Product.findById(productId);
        const result = await req.user.addToCart(product);
        console.log(result);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
    // let fetchedCart;
    // let newQuantity = 1;
    // req.user
    //     .getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts({ where: { id: productId } });
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0];
    //         }
    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         }
    //         return Product.findByPk(productId);
    //     })
    //     .then(product => {
    //         return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
    //     })
    //     .then(() => {
    //         res.redirect('/cart');
    //     })
    //     .catch(err => console.log(err));
};

exports.postCartDeleteProduct = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const result = await req.user.removeFromCart(productId);
        if (result) res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const userObj = await req.user.populate('cart.items.productId');
        const products = userObj.cart.items.map(item => {
            return { quantity: item.quantity, product: { ...item.productId } };
        });
        const order = new Order({
            user: {
                userId: req.user._id,
                email: req.user.email,
            },
            products: products,
        });
        const result = await order.save();
        if (result) {
            await req.user.clearCart();
            res.redirect('/orders');
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        console.log(orders);
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
