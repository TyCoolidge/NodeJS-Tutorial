const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'New user',
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
    },
    { timestamps: true } // auto createdat and modifiedat keys will be set
);

module.exports = mongoose.model('User', userSchema);
