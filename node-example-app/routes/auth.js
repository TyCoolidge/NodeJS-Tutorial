const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const router = express.Router();

// get and post use exact url match, so order of routes in app.js dont matter
router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        check('email')
            .normalizeEmail()
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom(async (value, { req }) => {
                const user = await User.findOne({ email: value });
                if (!user) {
                    return Promise.reject('Could not find a user with that email.');
                }
                req.body.user = user;
            }),
        body('password')
            .trim()
            .custom(async (value, { req }) => {
                const doesPasswordMatch = await bcrypt.compare(value, req.body.user.password);
                if (doesPasswordMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = req.body.user;
                    await req.session.save();
                    return true;
                }
                return Promise.reject('Incorrect password');
            }),
    ],
    authController.postLogin
);

router.post(
    '/signup',
    [
        check('email')
            .normalizeEmail()
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom(async (value, { req }) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('E-Mail exists already, please pick a different one.');
                }
                return user;
            }),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .trim()
            .isLength({ min: 5 })
            .isAlphanumeric(),
        body('confirmPassword')
            .trim()
            .isLength({ min: 5 })
            .isAlphanumeric()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!');
                }
                return true;
            }),
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
