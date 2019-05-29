const auth = require('../middleware/auth');
const express = require('express');
const userdb = require('../models/users');
const debug = require('debug')('app:routes:users');
const Joi = require('joi');

const router = express.Router();

function validateUser(input) {
    const schema = {
        name: Joi.string().required().min(3).max(20).regex(/^[a-z][a-z\d\-\_]+$/i),
        email: Joi.string().required().email().min(3).max(30),
        password: Joi.string().required().min(6).max(30).regex(/^[a-z\d\!\#\$\^\&\*\(\)\{\}\-\_\=\+]+$/i)
    }
    return Joi.validate(input, schema);
}
router.get('/me', auth, async (req, res) => {
    try {
        const user = await userdb.get(req.user.id);
        res.send(user);
    }
    catch(e) {
        res.status(500).send('Internal error occured');
    }
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await userdb.set(req.body);
        const token = await user.generateToken();
        res.header('x-auth-token', token).send(user)
    }
    catch(e) {
        res.status(500).send(`User was not created. ${e.message}`);
    }
});

module.exports = router;