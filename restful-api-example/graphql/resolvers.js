const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const clearImage = require('../util/file');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
    // hello() {
    //     return {
    //         text: 'Hello World',
    //         views: 123,
    //     };
    // },
    createUser: async function ({ userInput }, req) {
        const email = userInput.email;
        const name = userInput.name;
        const password = userInput.password;
        const errors = [];
        try {
            if (!validator.isEmail(email)) {
                errors.push({ message: 'E-Mail is invalid.' });
            }
            if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
                errors.push({ message: 'Password too short!' });
            }
            if (errors.length > 0) {
                const error = new Error('Invalid Input');
                error.data = errors;
                error.code = 422;
                throw error;
            }
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                const error = new Error('User exists already');
                throw error;
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email,
                name,
                password: hashedPassword,
            });
            const createdUser = await user.save();
            return { ...createdUser._doc, _id: createdUser._id.toString() };
        } catch (err) {
            throw err;
        }
    },
    createPost: async function ({ postInput }, req) {
        const title = postInput.title;
        const imageUrl = postInput.imageUrl;
        const content = postInput.content;
        const errors = [];
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
                errors.push({ message: 'Title is invalid.' });
            }
            if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
                errors.push({ message: 'Content is invalid.' });
            }
            if (errors.length > 0) {
                const error = new Error('Invalid Input');
                error.data = errors;
                error.code = 422;
                throw error;
            }
            const user = await User.findById(req.userId);
            if (!user) {
                const error = new Error('Invalid User!');
                error.code = 401;
                throw error;
            }
            const newPost = new Post({
                title,
                imageUrl,
                content,
                creator: user,
            });
            const result = await newPost.save();
            user.posts.push(result);
            await user.save();
            // add post to users post
            return {
                ...result._doc,
                _id: result._id.toString(),
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
            };
        } catch (err) {
            throw err;
        }
    },
    getPosts: async function ({ page = 1 }, req) {
        const perPage = 2;
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const totalItems = await Post.find().countDocuments();
            const posts = await Post.find()
                .populate('creator')
                .sort({ createdAt: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);
            if (!posts) {
                const error = new Error('No posts were found');
                error.statusCode = 404;
                throw error;
            }
            return {
                posts: posts.map(p => {
                    return {
                        ...p._doc,
                        _id: p._id.toString(),
                        createdAt: p.createdAt.toISOString(),
                        updatedAt: p.updatedAt.toISOString(),
                    };
                }),
                totalItems,
            };
        } catch (err) {
            throw err;
        }
    },
    getPost: async function ({ _id }, req) {
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const post = await Post.findById(_id).populate('creator');
            if (!post) {
                const error = new Error('Unable to find post');
                error.statusCode = 404;
                throw error;
            }
            return {
                ...post._doc,
                _id: post._id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
            };
        } catch (err) {
            throw err;
        }
    },
    updatePost: async function ({ _id, postInput }, req) {
        const { title, content, imageUrl } = postInput;
        const errors = [];
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const post = await Post.findById(_id).populate('creator');
            if (!post) {
                const error = new Error('Unable to find post');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator._id.toString() !== req.userId.toString()) {
                const error = new Error('Not Authorized!');
                error.statusCode = 403;
                throw error;
            }
            if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
                errors.push({ message: 'Title is invalid.' });
            }
            if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
                errors.push({ message: 'Content is invalid.' });
            }
            if (errors.length > 0) {
                const error = new Error('Invalid Input');
                error.data = errors;
                error.code = 422;
                throw error;
            }

            post.title = postInput.title;
            post.content = postInput.content;
            if (imageUrl !== 'undefined') {
                post.imageUrl = postInput.imageUrl;
            }
            const updatedPost = await post.save();
            console.log(updatedPost);
            return {
                ...updatedPost._doc,
                _id: updatedPost._id.toString(),
                createdAt: updatedPost.createdAt.toISOString(),
                updatedAt: updatedPost.updatedAt.toISOString(),
            };
        } catch (err) {
            throw err;
        }
    },
    deletePost: async function ({ _id }, req) {
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const post = await Post.findById(_id);
            if (!post) {
                const error = new Error('Unable to find post');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error('Not Authorized!');
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            await Post.findByIdAndRemove(_id);
            const user = await User.findById(req.userId);
            user.posts.pull(_id);
            await user.save();
            return true;
        } catch (err) {
            return false;
        }
    },
    user: async function (args, req) {
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const user = await User.findById(req.userId);
            if (!user) {
                const error = new Error('Unable to find user');
                error.statusCode = 404;
                throw error;
            }
            return {
                ...user._doc,
                _id: user._id.toString(),
            };
        } catch (err) {
            return false;
        }
    },
    updateStatus: async function ({ status }, req) {
        try {
            if (!req.isAuth) {
                const error = new Error('Not authenticated!');
                error.code = 401;
                throw error;
            }
            const user = await User.findById(req.userId);
            if (!user) {
                const error = new Error('Unable to find user');
                error.statusCode = 404;
                throw error;
            }
            if (!user.status === status) {
                const error = new Error('Input status is the same as the current status');
                error.statusCode = 404;
                throw error;
            }
            user.status = status;
            const updatedUser = await user.save();
            return {
                ...updatedUser._doc,
                _id: updatedUser._id.toString(),
            };
        } catch (err) {
            return false;
        }
    },
    login: async function ({ email, password }) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error('User not found.');
                error.code = 401;
                throw error;
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                const error = new Error('Password is incorrect.');
                error.code = 401;
                throw error;
            }
            const token = jwt.sign({ email: user.email, userId: user._id.toString() }, 'superdupersecret', {
                expiresIn: '1h',
            });
            return { token, userId: user._id.toString() };
        } catch (err) {
            throw err;
        }
    },
};
