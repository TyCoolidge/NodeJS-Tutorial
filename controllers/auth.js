const bcrypt = require('bcryptjs');

const User = require('../models/user');

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
    });
};

exports.postSignup = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.redirect('/signup');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
        });
        await user.save();
        return res.redirect('/login');
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
