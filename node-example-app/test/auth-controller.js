const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function () {
    it('should throw an error with code 500 if accessing the database fails', function () {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@email.com',
                password: 'tester',
            },
        };
        AuthController.login(req, {}, () => {}).then(result => {
            console.log(result);
        });
        User.findOne.restore();
    });
});
