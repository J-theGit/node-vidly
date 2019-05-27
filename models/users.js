const mongoose = require('mongoose');
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
        maxlength: 30
    },
    salt: {
        type: String,
        required: true,
        minlength:6,
        maxlength:30
    }
});

const User = mongoose.model('User', userSchema);

async function createUser(input) {
    const salt = cryptoString({ length: 15, type: 'base64' });
    const hash = crypto.createHash('sha256').update(input.password).digest('base64');
    const password = crypto.createHash('sha256').update(salt+hash+salt).digest('base64');

    const user = new User({
        name: input.name,
        email: input.email,
        password,
        salt
    });
    return await user.save();
}

module.exports.set = createUser;