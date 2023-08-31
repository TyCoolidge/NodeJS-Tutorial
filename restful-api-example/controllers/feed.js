const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find();
        if (!posts) {
            const error = new Error('No posts were found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Posts fetched successfully.',
            posts,
            totalPosts: posts.length,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err); // have to use next since this is asyncronous code (pass to next middleware)
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const title = req.body.title;
        const content = req.body.content;
        const post = new Post({
            title,
            content,
            imageUrl: 'https://www.pngkit.com/png/detail/182-1822759_the-binding-of-isaac-binding-of-isaac-rebirth.png',
            creator: { name: 'Tyler' },
        });
        const result = await post.save();
        res.status(201).json({
            message: 'Post created successfully',
            post: result,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err); // have to use next since this is asyncronous code (pass to next middleware)
    }
};

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        console.log(postId);
        const post = await Post.findById(postId);
        console.log({ post });
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched.',
            post,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err); // have to use next since this is asyncronous code (pass to next middleware)
    }
};
