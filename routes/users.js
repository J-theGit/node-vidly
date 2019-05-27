const express = require('express');
const userdb = require('../models/users');
const Joi = require('joi');

const router = express.Router();

function validateUser(input) {
    const schema = {
        name: Joi.string().required().min(3).max(20).regex(/^[a-z][a-z\d\-\_]+$/i),
        email: Joi.string().required().email({ minDomainSegments: 2 }).min(3).max(30),
        password: Joi.string().required().min(6).max(30).regex(/^[a-z\d\!\#\$\^\&\*\(\)\{\}\-\_\=\+]+$/i)
    }
    return Joi.validate(input, schema);
}

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await userdb.set(req.body);
        res.send(user)
    }
    catch(e) {
        res.status(500).send('Internal error occured, user was not created');
    }
});