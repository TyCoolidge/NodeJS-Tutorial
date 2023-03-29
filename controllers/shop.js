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
    // FIND ALL Syntax
    // console.log(
    //     Product.findAll({ where: { id: productId } })
    //         .then(prod => prod)
    //         .catch(err => console.log(err))
    // );
    Product.findByPk(productId)
        .then(product => {
            console.log(product);
            res.render('shop/product-detail', {
                product: product,
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
    // console.log(req.user.cart);
    req.user
        .getCart()
        .then(cart => {
            console.log(cart);
            return cart
                .getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products,
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));

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

exports.postCart = (req, res, next) => {
    const { productId } = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(
                        products.map(product => {
                            product.orderItem = { quantity: product.cartItem.quantity };
                            return product;
                        })
                    );
                })
                .catch(err => console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({ include: ['products'] })
        .then(orders => {
            console.log(orders);
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders,
            });
        })
        .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};
