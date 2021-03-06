const _ = require('lodash');
const mongoose = require('mongoose');
const debug = require('debug')('app:models:users');
const crypto = require('crypto');
const cryptoString = require('crypto-random-string');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    admin: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255
    },
    salt: {
        type: String,
        required: true,
        minlength:6,
        maxlength:255
    }
});

userSchema.methods.generateToken = function() {
    const key = config.get('private-key');
    return jwt.sign({
        id: this._id,
        user: this.name,
        admin: this.admin,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
    }, key);
}

const User = mongoose.model('User', userSchema);

async function createUser(input) {
    const existingName = await User.findOne({ name: input.name });
    if (existingName) throw new Error(`User ${input.name} already exists`)

    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) throw new Error(`Email ${input.email} already exists`)

    const salt = cryptoString({ length: 15, type: 'hex' });
    const hash = crypto.createHash('sha256').update(input.password).digest('hex');
    const password = crypto.createHash('sha256').update(salt+hash+salt).digest('hex');

    const user = new User({ 
        name: input.name,
        email: input.email,
        password,
        salt
    });
    try {
        await user.save();
        return _.pick(user,['_id', 'name', 'generateToken']);
    }
    catch (e) {
        debug(e);
        throw new Error('Internal error.');
    }
}

async function getUser(id) {
    return await User.findById(id)
        .select('-password -salt');
}

module.exports.set = createUser;
module.exports.get = getUser;
module.exports.User = User;