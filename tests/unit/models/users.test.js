const debug = require('debug')('app:tests:models:users');
const config = require('config');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models/users');

describe('generateToken', () => {
    it('should throw when key is invalid', () => {
        const user = new User({name: 'jev'})
        const key = '1';
        const token = user.generateToken();
        expect(() => jwt.verify(token, key)).toThrow();
    });

    it('should create a valid token when key is non-empty', () => {
        const user = new User({name: 'jev'})
        const key = config.get('private-key');
        const token = user.generateToken();
        const verifiedUser = jwt.verify(token, key);

        expect(verifiedUser.user).toBe('jev');
        expect(verifiedUser.admin).toBe(false);
        expect(verifiedUser.exp).toBeGreaterThan(0);
        expect(verifiedUser.iat).toBeGreaterThan(0);
    });
});
