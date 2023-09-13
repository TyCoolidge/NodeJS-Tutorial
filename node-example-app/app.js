// // core modules
// /*
// http https fs path os
// */
// // if we dont use ./ then it will look for global module
// const http = require('http');

// // const routes = require('./routes');
// // function rqListener(request, response) {}
// // http.createServer(rqListener);

// // http.createServer(function (req, res) {});

// const server = http.createServer(routes);

// server.listen(3100);

// // EVENT LOOP
// // timers (execute setTimeouts, setIntervals callbacks) => pending callbacks (executes)
// // => poll (executes or defers/ can jump to timer execution)
// // => Check (executes setImmediate callbacks) => close callbacks (executes)
// // => process.exit if refs(event listeners/callbacks) === 0

// USING EXPRESS - Section 5
const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.8ljpbvu.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
// const expressHandbars = require('express-handlebars');
// const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require('mongoose');
const app = express();
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    cb(null, false);
};
// HANDLEBARS
// default is views/layouts/
// app.engine(
//   'hbs',
//   expressHandbars({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'hbs',
//   })
// );
// app.set('view engine', 'hbs');

// PUG
// app.set('view engine', 'pug');

// EJS
// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/not-found');
const User = require('./models/user');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream })); // manually adding request logs to check what is going on with the server

app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// NOTE in product the secret should be long
app.use(session({ secret: 'superdupersecretkey', resave: false, saveUninitialized: false, store }));

app.use(csrfProtection);
app.use(flash());

// middleware for static files folder
// allows use to import css files

app.use((req, res, next) => {
    // setting local vars that are set in our views
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    try {
        const existingUser = await User.findById(req.session.user._id);
        if (!existingUser) return next();
        req.user = existingUser;
        return next();
    } catch (err) {
        console.log({ err });
        // IMPORTANT - in async / callback middleware you must next() the error to avoid infinite loop
        next(new Error(err));
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.getNotFoundPage);

app.use((error, req, res, next) => {
    console.log({ error });
    // res.status(error.httpStatusCode).render(...)
    // res.redirect('/500');
    res.status(500).render('500', { pageTitle: 'Error', path: '/500', isAuthenticated: req.session.isLoggedIn });
});
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// User.hasMany(Product); // don't need both but better readability
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem }); // through ==== where connection is stored
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });

// //looks at all models and syncs to database
// sequelize
//     // .sync({ force: true }) //CAUTION do not use on PROD as this clears out table
//     .sync()
//     .then(result => {
//         return User.findByPk(1);
//         // console.log(result);
//         // app.listen(3100);
//     })
//     .then(user => {
//         // returning value in .then block is wrapped in new promise
//         // MAKE SURE return values in a promise are the same type
//         if (!user) {
//             return User.create({ name: 'Tyler', email: 'test@gmail.com' });
//         }
//         return user;
//     })
//     .then(user => {
//         return user.createCart();
//     })
//     .then(cart => {
//         app.listen(3800);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// const server = http.createServer(app);

// server.listen(3100);

// app.use('/', (req, res, next) => {
//     console.log('In the middleware!');
//     next(); // allows request to travel to next middleware func
// });

// it will listen for all routes that start with /

// mongoConnect(() => {
//     app.listen(3800);
// });

mongoose
    .connect(MONGO_URI)
    .then(() => {
        // https.createServer({ key: privateKey, cert: certificate }, app).listen(process.env.PORT || 3000); //manually adding ssl server, usually host provider will cover
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log(err));
