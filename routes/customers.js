const express = require('express');
const Joi = require('../custom/joi');
const debug = require('debug')('app:routes:customers');
const custdb = require('../models/customers');

const router = express.Router();

const customerSchema = {
    isGold: Joi.boolean(),
    name: Joi.string().min(3).max(30).required(),
    phone: Joi.string().min(9).required()
}

function validateCustomer(input) {
    return Joi.validate(input,customerSchema);
}

router.get('/', async (req, res) => {
    const customers = await custdb.get();
    res.send(customers);
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await custdb.get(req.params.id);
        if (!customer) return res.status(404).send('customer with provided ID couldn\'t be found');
        res.send(customer);
    }
    catch (e) {
        res.status(404).send('customer with provided ID couldn\'t be found');
    }
});

router.post('/', async (req, res) => {
    const { error } = validateCustomer(req.body)
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await custdb.set(req.body);
    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const { error } = validateCustomer(req.body)
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const customer = await custdb.update(req.params.id, req.body);
        res.send(customer);
    }
    catch (e) {
        res.status(404).send('customer with provided ID couldn\'t be found');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const customer = await custdb.delete(req.params.id);
        if (!customer) return res.status(404).send('customer with provided ID couldn\'t be found');
        res.send(customer);
    }
    catch (e) {
        res.status(404).send('customer with provided ID couldn\'t be found');
    }
});

module.exports = router;