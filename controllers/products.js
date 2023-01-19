const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // res.send(
    //   '<form action="/admin/add-product" method="POST"><input type="text" name="product" placeholder="Add Product"/><button type="submit">Submit</button></form>'
    // ); // bad practice to use next after sending response
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));

    // for pug
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        activeAddProduct: true,
        formsCSS: true,
        productCSS: true,
    });
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    console.log(product);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll();
    res.render('shop', {
        products,
        pageTitle: 'Shop',
        path: '/',
        activeShop: true,
        productCSS: true,
    });
    // by joining (this will work for all OS, ex: Windows uses \)
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    // res.send('<h1>Hello from Express</h1>'); // sends response, DOES not go to next middleware
};
