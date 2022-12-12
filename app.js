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
const express = require('express');

const app = express();

app.use('/', (req, res, next) => {
  console.log('In the middleware!');
  next(); // allows request to travel to next middleware func
});

app.use('/add-product', (req, res, next) => {
  console.log('In another middleware!');
  res.send('<h1>Add product page</h1>'); // bad practice to uset next after sending response
});

// it will listen for all routes that start with /
app.use('/', (req, res, next) => {
  console.log('In another middleware!');
  res.send('<h1>Hello from Express</h1>'); // sends response, DOES not go to next middleware
});

app.listen(3100);
// const server = http.createServer(app);

// server.listen(3100);
