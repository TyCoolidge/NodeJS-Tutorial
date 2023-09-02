const User = require('../models/user');

exports.getStatus = async (req, res, next) => {
    try {
        const { status } = await User.findById(req.userId);
        res.status(200).json({ message: 'User status fetched!', status });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { newStatus } = req.body;
        const user = await User.findById(req.userId);
        if (newStatus === user.status) {
            const error = new Error("The newly typed status matches the user's current one.");
            error.statusCode = 422;
            throw error;
        }
        user.status = newStatus;
        await user.save();
        res.status(200).json({ message: 'User status updated!', newStatus });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
