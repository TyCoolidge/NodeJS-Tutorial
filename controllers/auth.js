const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');

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
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error'),
    });
};

exports.postSignup = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash('error', 'Email already exists, please pick a different one.');
            return res.redirect('/signup');
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
        console.log(err);
    }
};

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            req.flash('error', 'Invalid email');
            return res.redirect('/login');
        }
        const doesPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (doesPasswordMatch) {
            req.session.isLoggedIn = true;
            req.session.user = existingUser;
            await req.session.save();
            return res.redirect('/');
        }
        req.flash('error', 'Invalid password');
        return res.redirect('/login');
    } catch (err) {
        console.log({ err });
    }
    // req.isLoggedIn = true; -> values gets reset on each function call
    // Secure -> only HTTPS
    // httpOnly -> only HTTP
    // Max-Age -> timer in seconds on how long cookie stays alive
    // Expires -> date format; ex: Wed, 21 Oct 2015 07:28:00 GMT
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10');
};

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
