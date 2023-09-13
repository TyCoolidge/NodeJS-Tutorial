const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: process.env.SENDGRID_API,
        },
    })
);

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')
    //     .filter(cookie => cookie.includes('loggedIn'))[0]
    //     .trim()
    //     .split('=')[1];
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        validationErrors: [],
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: [],
    });
};

exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password, confirmPassword },
                validationErrors: errors.array(),
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
        });
        await user.save();
        res.redirect('/login');
        // changed order because we still want to login even if the email throws an error
        // Never use this in a 'blocking' way. We dont want to slow down large scale application
        return await transporter.sendMail({
            to: email,
            from: 'tylercoolidge1998@gmail.com',
            subject: 'Signup Completed!',
            html: '<h1>Signup Successful</h1>',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array(),
        });
    }

    return res.redirect('/');
};
// req.isLoggedIn = true; -> values gets reset on each function call
// Secure -> only HTTPS
// httpOnly -> only HTTP
// Max-Age -> timer in seconds on how long cookie stays alive
// Expires -> date format; ex: Wed, 21 Oct 2015 07:28:00 GMT
// res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10');

exports.postLogout = async (req, res, next) => {
    req.session.destroy(err => {
        if (!err) res.redirect('/');
    });
};

// renders initial page
exports.getReset = async (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error'),
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        try {
            if (err) {
                console.log(err);
                return res.redirect('/reset');
            }
            const token = buffer.toString('hex');
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpire = Date.now() + 3600000; // expires in one hour
            await user.save();
            res.redirect('/');
            return await transporter.sendMail({
                to: req.body.email,
                from: 'tylercoolidge1998@gmail.com',
                subject: 'Password reset',
                html: `
                    <p>Your requested a password reset</p>
                    <p>Click this <a href="${req.protocol}://${req.get('host')}${
                    req.originalUrl
                }/${token}">link</a> to set a new password.</p>
                `,
            });
        } catch (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        }
    });
};

exports.getNewPassword = async (req, res, next) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: req.flash('error'),
            userId: user._id.toString(),
            passwordToken: token,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};

exports.postNewPassword = async (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    try {
        const user = await User.findOne({
            resetToken: passwordToken,
            resetTokenExpire: { $gt: Date.now() },
            _id: userId,
        });
        const newPasswordToken = await bcrypt.hash(newPassword, 12);
        user.password = newPasswordToken;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        const result = await user.save();
        if (result) res.redirect('/login');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    }
};
