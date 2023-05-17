const Product = require('../models/product');

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
    Product.fetchAll()
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
    // FIND ALL Syntax sequelize
    // console.log(
    //     Product.findAll({ where: { id: productId } })
    //         .then(prod => prod)
    //         .catch(err => console.log(err))
    // );
    Product.fetchOne(productId)
        .then(product => {
            console.log({ product });
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
            });
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    console.log('index');
    // Product.findAll().then(products =>console.log(products)).catch(err => console.log(err))
    fetchAllRender('shop/index', 'Shop', '/', res);
};

exports.getCart = async (req, res, next) => {
    // console.log(req.user.cart);
    try {
        const cartProducts = await req.user.getCart();
        console.log({ cartProducts });
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: cartProducts,
        });
    } catch (err) {
        console.log(err);
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
        const { userId, ...product } = await Product.fetchOne(productId);
        const result = await req.user.addToCart(product);
        console.log(result);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
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
        const result = await req.user.deleteFromCart(productId);
        if (result) res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const result = await req.user.addOrder();
        if (result) res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await req.user.getOrders();
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
