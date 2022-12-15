const express = require('express');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/', (req, res, next) => {
  res.send('<h1>Hello from Express</h1>'); // sends response, DOES not go to next middleware
});

module.exports = router;
