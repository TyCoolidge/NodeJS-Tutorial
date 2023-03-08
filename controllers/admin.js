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
    // const product = new Product(null, title, imageUrl, description, price);
    // console.log(product);
    // product
    //     .save()
    //     .then(() => {
    //         res.redirect('/');
    //     })
    //     .catch(err => console.log(err));
    // createProduct exist on req.user obj because of link we created in app.js
    req.user
        .createProduct({
            title,
            imageUrl,
            description,
            price,
        })
        // Product.create({
        //     title,
        //     imageUrl,
        //     description,
        //     price,
        //     // userId: req.user.id,
        // })
        .then(result => {
            console.log('Created Product!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    req.user
        .getProducts({ where: { id: productId } })
        // Product.findByPk(productId)
        .then(products => {
            const product = products[0];
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product,
            });
        })
        .catch(e => console.log(e));
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const { title, imageUrl, description, price } = req.body;

    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;
            return product.save();
        })
        .then(result => {
            console.log('updated product');
            res.redirect('/admin/products'); // move redirect here so we redirect after promise is fulfilled
        })
        .catch(e => console.log(e));
};

exports.getAdminProducts = (req, res, next) => {
    // Product.findAll()
    req.user
        .getProducts()
        .then(products => {
            res.render('admin/products', {
                products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            });
        })
        .catch(e => console.log(e));
};

exports.postDeleteProducts = (req, res, next) => {
    const productId = req.body.productId;
    // Product.destroy({}) // using 'where'
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then(result => {
            console.log(result);
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
    res.redirect('/admin/products');
};
