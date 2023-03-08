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

const express = require('express');
// const expressHandbars = require('express-handlebars');

const app = express();

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
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/shop');
const notFoundController = require('./controllers/not-found');

app.use(express.urlencoded({ extended: false }));

// only runs for incoming request not npm start
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// middleware for static files folder
// allows use to import css files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(publicRoutes);

app.use(notFoundController.getNotFoundPage);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product); // don't need both but better readability
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem }); // through ==== where connection is stored
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//looks at all models and syncs to database
sequelize
    // .sync({ force: true }) //CAUTION do not use on PROD as this clears out table
    .sync()
    .then(result => {
        return User.findByPk(1);
        // console.log(result);
        // app.listen(3100);
    })
    .then(user => {
        // returning value in .then block is wrapped in new promise
        // MAKE SURE return values in a promise are the same type
        if (!user) {
            return User.create({ name: 'Tyler', email: 'test@gmail.com' });
        }
        return user;
    })
    .then(user => {
        return user.createCart();
    })
    .then(cart => {
        app.listen(3800);
    })
    .catch(err => {
        console.log(err);
    });

// const server = http.createServer(app);

// server.listen(3100);

// app.use(publicRoutes);

// app.use('/', (req, res, next) => {
//   console.log('In the middleware!');
//   next(); // allows request to travel to next middleware func
// });

// it will listen for all routes that start with /
