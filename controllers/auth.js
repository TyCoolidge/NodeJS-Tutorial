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
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const existingUser = await User.findById('646670f09609f4e58ff7bacd');
        if (existingUser) {
            req.session.user = existingUser;
        } else {
            const user = new User({
                name: 'Tyler',
                email: 'tyler@test.com',
                cart: {
                    items: [],
                },
            });
            user.save();
            req.session.user = user;
        }
        req.session.isLoggedIn = true;
        res.redirect('/');
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
        console.log('logout err', err);
        if (!err) res.redirect('/');
    });
};
