const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post(
    '/posts',
    [
        // backend validation, frontend already has validation (should match)
        body('title').trim().isLength({ min: 7 }),
        body('content').trim().isLength({ min: 5 }),
    ],
    feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

module.exports = router;
