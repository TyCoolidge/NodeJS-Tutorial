const expect = require('chai').expect;
const authMiddleware = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

// NOTE: dont test 3rd party funcs, they should already work

describe('Auth middleware', function () {
    it('should throw error if no auth header is present', function () {
        const req = {
            get: function () {
                return null;
            },
        };

        expect(() => authMiddleware(req, {}, () => {})).to.throw('Not authenticated.');
    });

    it('should throw error if auth header is only one string', function () {
        const req = {
            get: function () {
                return 'xyz';
            },
        };

        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });

    it('should yield userId aftering decoding the token', async function () {
        // const token = await jwt.sign(
        //     {
        //         email: 'test@test.com',
        //         userId: '27',
        //     },
        //     'superdupersecret',
        //     { expiresIn: '1h' }
        // );
        const req = {
            get: function () {
                return 'Bearer fsdfdss';
            },
        };
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'abc' });
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });

    it('should throw error if token cannot be verified', function () {
        const req = {
            get: function () {
                return 'Bearer xyz';
            },
        };

        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });
});
