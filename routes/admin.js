const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

// can use same url route only for different API methods
router.get('/add-product', (req, res, next) => {
  // res.send(
  //   '<form action="/admin/add-product" method="POST"><input type="text" name="product" placeholder="Add Product"/><button type="submit">Submit</button></form>'
  // ); // bad practice to use next after sending response
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  // const body =
  res.redirect('/');
});

module.exports = router;
