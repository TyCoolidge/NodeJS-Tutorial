const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');
const UserController = require('../controllers/user');

describe('Auth Controller', function () {
    // beforeEach(function() {}) // different than below, this calls before each "it". so it runs multiple times
    // afterEach(function() {}) // different than after, this calls after each "it". so it runs multiple times

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

    it('should throw an error with code 500 if accessing the database fails', function (done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@email.com',
                password: 'tester',
            },
        };
        AuthController.login(req, {}, () => {})
            .then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 500);
                done();
            })
            .catch(err => {
                done(err);
            });
        User.findOne.restore();
    });

    it('should send a response with a valid user status for an existing user', async function () {
        const req = { userId: '5d5c4a1a59d4c25d4387fde8' };
        const res = {
            statusCode: 500,
            userStatus: null,
            // message: 'User status fetched!',
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            },
        };
        await UserController.getStatus(req, res, () => {});
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('New user'); // test if default value works
    });

    after(async function () {
        await User.deleteMany({});
        await mongoose.disconnect();
    });
});
