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

const app = express();

const adminData = require('./routes/admin');
const publicRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: false }));

// middleware for static files folder
// allows use to import css files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(publicRoutes);

app.use((req, res) => {
  // res.status(404).send('<h1>Page not found</h1>');
  res.status(404).sendFile(path.join(__dirname, 'views', 'not-found.html'));
});

app.listen(3100);
// const server = http.createServer(app);

// server.listen(3100);

// app.use(publicRoutes);

// app.use('/', (req, res, next) => {
//   console.log('In the middleware!');
//   next(); // allows request to travel to next middleware func
// });

// it will listen for all routes that start with /
