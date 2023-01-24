const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // res.send(
    //   '<form action="/admin/add-product" method="POST"><input type="text" name="product" placeholder="Add Product"/><button type="submit">Submit</button></form>'
    // ); // bad practice to use next after sending response
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));

    // for pug
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        activeAddProduct: true,
        formsCSS: true,
        productCSS: true,
    });
};

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(title, imageUrl, price, description);
    console.log(product);
    product.save();
    res.redirect('/');
};

exports.getAdminProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    });
};
