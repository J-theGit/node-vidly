const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const Joi = require('joi');
const debug = require('debug')('app:routes:customers');
const custdb = require('../models/customers');

const router = express.Router();

function validateCustomer(input) {
    const schema = {
        isGold: Joi.boolean(),
        name: Joi.string().min(3).max(30).required(),
        phone: Joi.string().min(9).required()
    }
    return Joi.validate(input,schema);
}

function validateId(input) {
    const schema = {
        id: Joi.objectId().required()
    }
    return Joi.validate(input, schema);
}

router.get('/', async (req, res) => {
    const customers = await custdb.get();
    res.send(customers);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.message);

    const customer = await custdb.get(req.params.id);
    if (!customer) return res.status(404).send('customer with provided ID couldn\'t be found');

    res.send(customer);
    

});

router.post('/', auth, async (req, res) => {
    const { error } = validateCustomer(req.body)
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const customer = await custdb.set(req.body);
        res.send(customer);
    }
    catch(e) {
        res.status(500).send('Internal error occured, customer not saved');
    }
});

router.put('/:id', auth, async (req, res) => {
    let { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);
    
    error = validateCustomer(req.body).error;
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const customer = await custdb.update(req.params.id, req.body);
        if (!customer) return res.status(404).send('customer with provided ID couldn\'t be found');

        res.send(customer);
    }
    catch (e) {
        res.status(500).send('Internal error occured, customer not updated');
    }
});

router.delete('/:id', auth, admin, async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const customer = await custdb.delete(req.params.id);
        if (!customer) return res.status(404).send('customer with provided ID couldn\'t be found');

        res.send(customer);
    }
    catch (e) {
        res.status(500).send('Internal error occured, customer not deleted');
    }
});

module.exports = router;