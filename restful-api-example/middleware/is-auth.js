const jwt = require('jsonwebtoken');

// GRAPH QL
// module.exports = (req, res, next) => {
//     try {
//         const authHeader = req.get('Authorization');
//         if (!authHeader) {
//             const error = new Error('Not authenticated.');
//             error.statusCode = 401;
//             throw new Error();
//         }
//         const token = authHeader.split(' ')[1];
//         const decodedToken = jwt.verify(token, 'superdupersecret');
//         if (!decodedToken) {
//             const error = new Error('Not authenticated.');
//             error.statusCode = 401;
//             throw error;
//         }
//         req.userId = decodedToken.userId;
//         req.isAuth = true;
//         next();
//     } catch (err) {
//         req.isAuth = false;
//         return next();
//     }
// };

// REST
module.exports = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, 'superdupersecret');
        if (!decodedToken) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
};
