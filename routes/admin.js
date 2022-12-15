const express = require('express');

const router = express.Router();

// can use same url route only of different API methods
router.get('/add-product', (req, res, next) => {
  res.send(
    '<form action="/admin/add-product" method="POST"><input type="text" name="product" placeholder="Add Product"/><button type="submit">Submit</button></form>'
  ); // bad practice to uset next after sending response
});

router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  // const body =
  res.redirect('/');
});

module.exports = router;
