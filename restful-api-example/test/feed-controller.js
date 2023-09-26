const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const io = require('../socket');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');
const UserController = require('../controllers/user');

describe('Feed Controller', function () {
    before(async function () {
        //runs "before" all test
        await mongoose.connect('mongodb+srv://tyacoolidge:E6imS1oVko9dYP4L@cluster0.8ljpbvu.mongodb.net/test');
        const user = new User({
            email: 'email@email.com',
            password: 'Tester',
            name: 'Test',
            posts: [],
            _id: '5d5c4a1a59d4c25d4387fde8',
        });
        await user.save();
    });

    it('should add a created post to the posts of the creator', async function () {
        const req = {
            body: {
                title: 'test post',
                content: 'test content',
            },
            file: {
                path: 'xyz',
            },
            userId: '5d5c4a1a59d4c25d4387fde8',
        };
        const res = {
            status: function () {
                return this;
            },
            json: function () {},
        };
        const stub = sinon.stub(io, 'getIO').callsFake(() => {
            return {
                emit: function () {},
            };
        });

        const savedUser = await FeedController.createPost(req, res, () => {});
        console.log(savedUser.posts);
        stub.restore();
        expect(savedUser).to.have.property('posts');
        expect(savedUser.posts).to.have.length(1);
    });

    after(async function () {
        await User.deleteMany({});
        // await Post.deleteMany({});
        await mongoose.disconnect();
    });
});
