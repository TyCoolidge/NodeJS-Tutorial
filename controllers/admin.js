const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

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
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = async (req, res, next) => {
    const { title, description, price } = req.body;
    // IMPORTANT NOT TO SAVE FILES IN DB (too much memory)
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                description,
                price,
            },
            errorMessage: 'Attached file is not an image',
            validationErrors: [],
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                description,
                price,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    const imageUrl = image.path;
    try {
        // console.log(req);
        const newProduct = new Product({ title, imageUrl, description, price, userId: req.user._id });
        await newProduct.save();
        console.log('Created Product!');
        res.redirect('/admin/products');
    } catch (err) {
        // return res.status(500).render('admin/edit-product', {
        //     pageTitle: 'Add Product',
        //     path: '/admin/add-product',
        //     editing: false,
        //     hasError: true,
        //     product: {
        //         title,
        //         imageUrl,
        //         description,
        //         price,
        //     },
        //     errorMessage: 'Database operation failed, please try again',
        //     validationErrors: [],
        // });
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
    // const product = new Product(null, title, imageUrl, description, price);
    // console.log(product);
    // product
    //     .save()
    //     .then(() => {
    //         res.redirect('/');
    //     })
    //     .catch(err => console.log(err));
    // createProduct exist on req.user obj because of link we created in app.js
    // req.user
    //     .createProduct({
    //         title,
    //         imageUrl,
    //         description,
    //         price,
    //     })
    //     // Product.create({
    //     //     title,
    //     //     imageUrl,
    //     //     description,
    //     //     price,
    //     //     // userId: req.user.id,
    //     // })
    //     .then(result => {
    //         console.log('Created Product!');
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => console.log(err));
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const { title, description, price, imageUrl } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                hasError: true,
                product: {
                    title,
                    description,
                    price,
                    _id: productId,
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
            });
        }
        const modifier = { title, description, price };
        if (image) {
            fileHelper.deleteFile(imageUrl);
            modifier.imageUrl = image.path;
        }
        const product = await Product.findOneAndUpdate(
            // if product is found, then we will update
            { _id: productId, userId: req.user._id },
            modifier
        );
        if (!product) return res.redirect('/');
        console.log('updated product');
        res.redirect('/admin/products'); // move redirect here so we redirect after promise is fulfilled
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.getAdminProducts = async (req, res, next) => {
    try {
        // const products = await Product.find().select('title price -_id').populate('userId', 'name');
        const products = await Product.find({ userId: req.user._id });
        res.render('admin/products', {
            products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.postDeleteProducts = async (req, res, next) => {
    try {
        const { imageUrl, productId } = req.body;
        fileHelper.deleteFile(imageUrl);

        const result = await Product.findOneAndDelete({ _id: productId, userId: req.user._id });
        if (!result) return res.redirect('/');
        console.log('DESTROYED PRODUCT');
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};
