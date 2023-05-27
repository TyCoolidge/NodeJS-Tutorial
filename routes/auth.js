const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;