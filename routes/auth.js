const debug = require('debug')('app:routes:auth');
const express = require('express');
const Joi = require('../custom/joi');
const authdb = require('../models/auth');
const router = express.Router();

function validateLogin(input) {
    const schema = {
        name: Joi.string().required().min(3).max(20),
        password: Joi.string().required().min(6).max(30)
    }
    return Joi.validate(input, schema);
}

router.post('/', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const login = await authdb.get(req.body);
        res.send(login);
    }
    catch(e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;