const _ = require('lodash');
const crypto = require('crypto');
const debug = require('debug')('app:models:auth');
const { User } = require('./users');

async function login(input) {
    const user = await User.findOne({ name: input.name });
    if (!user) throw new Error('username or password incorrect');

    const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');
    const hash = crypto.createHash('sha256')
        .update(user.salt + hashedPassword + user.salt)
        .digest('hex');

    if (hash !== user.password) throw new Error('username or password incorrect');

    return await user.generateToken();
}

module.exports.get = login;