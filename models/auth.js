const _ = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const debug = require('debug')('app:models:auth');
const config = require('config');
const fs = require('fs');
const { User } = require('./users');

async function login(input) {
    const user = await User.findOne({ name: input.name });
    if (!user) throw new Error('username or password incorrect');

    const hashedPassword = crypto.createHash('sha256').update(input.password).digest('hex');
    const hash = crypto.createHash('sha256')
        .update(user.salt + hashedPassword + user.salt)
        .digest('hex');

    if (hash !== user.password) throw new Error('username or password incorrect');

    const key = await new Promise((resolve) => {
        fs.readFile(config.get('private-key'), (err, content) => resolve(content));
    });
    
    const token = jwt.sign({
        id: user._id,
        user: user.name,
        issued: Date.now(),
        admin: true
    }, key);

    return token;
}

module.exports.get = login;