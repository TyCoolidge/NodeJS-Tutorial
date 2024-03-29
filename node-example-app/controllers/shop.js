const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;
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
const fetchAllRender = async (page, pageTitle, path, req, res, next) => {
    const pageNumber = +req.query.page || 1;

    try {
        const totalProducts = await Product.find().count();
        const products = await Product.find()
            .skip((pageNumber - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        res.render(page, {
            products,
            pageTitle,
            path,
            currentPage: pageNumber,
            hasNextPage: ITEMS_PER_PAGE * pageNumber < totalProducts,
            hasPreviousPage: pageNumber > 1,
            nextPage: pageNumber + 1,
            previousPage: pageNumber - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
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
    fetchAllRender('shop/product-list', 'All products', '/products', req, res, next);
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
    // Product.findAll().then(products =>console.log(products)).catch(err => console.log(err))
    fetchAllRender('shop/index', 'Shop', '/', req, res, next);
};

exports.getCart = async (req, res, next) => {
    // console.log(req.user.cart);
    try {
        const userObj = await req.user.populate('cart.items.productId');
        const cartProducts = userObj.cart.items;
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

exports.getCheckout = async (req, res, next) => {
    try {
        const userObj = await req.user.populate('cart.items.productId');
        const cartProducts = userObj.cart.items;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartProducts.map(item => {
                return {
                    price_data: {
                        product_data: {
                            name: item.productId.title,
                            description: item.productId.description,
                        },
                        unit_amount: item.productId.price * 100,
                        currency: 'usd',
                    },
                    quantity: item.quantity,
                };
            }),
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
            cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
        });

        res.render('shop/checkout', {
            path: '/checkout',
            pageTitle: 'Checkout',
            products: cartProducts,
            totalSum: cartProducts.reduce((acc, curr) => (acc += curr.quantity * curr.productId.price), 0),
            sessionId: session.id,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.getOrder = async (req, res, next) => {
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

exports.getInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized'));
        }
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data', 'invoices', invoiceName);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true,
        });
        pdfDoc.text('-------------------------');

        let totalPrice = 0;
        order.products.forEach(item => {
            totalPrice += item.quantity * item.product.price;
            pdfDoc.fontSize(14).text(`${item.product.title} - ${item.quantity} x $${item.product.price}`);
        });
        pdfDoc.text('-------------------------');
        pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
        pdfDoc.end();
    } catch (err) {
        next(err);
    }
};
