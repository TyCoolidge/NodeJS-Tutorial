const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // res.send(
    //   '<form action="/admin/add-product" method="POST"><input type="text" name="product" placeholder="Add Product"/><button type="submit">Submit</button></form>'
    // ); // bad practice to use next after sending response
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));

    // for pug
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    const product = new Product(null, title, imageUrl, description, price);
    console.log(product);
    product
        .save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product,
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const { title, imageUrl, description, price } = req.body;
    const updatedProduct = new Product(productId, title, imageUrl, description, price);
    updatedProduct.save();
    res.redirect('/admin/products');
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

exports.postDeleteProducts = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect('/admin/products');
};
