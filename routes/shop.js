const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', (req, res, next) => {
  console.log('shop.js', adminData.products);
  const products = adminData.products;
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
});

module.exports = router;
