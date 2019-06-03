const express = require('express');
const Joi = require('joi');
const debug = require('debug')('app:routes:returns');
const auth = require('../middleware/auth');
const rentals = require('../models/rentals');
const router = express.Router();

function validateId(obj) {
    const schema = {
        id: Joi.objectId().required()
    }
    return Joi.validate(obj, schema);
}

router.post('/:id', auth, async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const rental = await rentals.submit(req.params.id);
    if (!rental) return res.status(400).send('rental was already returned');

    res.send(rental);
});

module.exports = router;