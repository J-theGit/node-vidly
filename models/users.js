const mongoose = require('mongoose');
const debug = require('debug')('app:models:users');
const crypto = require('crypto');
const cryptoString = require('crypto-random-string');

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
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 50
    },
    salt: {
        type: String,
        required: true,
        minlength:6,
        maxlength:50
    }
});

const User = mongoose.model('User', userSchema);

async function createUser(input) {
    const existingName = await User.findOne({ name: input.name });
    if (existingName) throw new Error(`User ${input.name} already exists`)

    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) throw new Error(`Email ${input.email} already exists`)

    const salt = cryptoString({ length: 15, type: 'base64' });
    const hash = crypto.createHash('sha256').update(input.password).digest('base64');
    const password = crypto.createHash('sha256').update(salt+hash+salt).digest('base64');

    const user = new User({ 
        name: input.name,
        email: input.email,
        password,
        salt
    });
    try {

        await user.save();
        return { _id: user._id, name: user.name };
    }
    catch (e) {
        debug(e);
        throw new Error('Internal error.');
    }
}

module.exports.set = createUser;