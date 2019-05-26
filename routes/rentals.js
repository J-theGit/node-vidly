const express = require('express');
const debug = require('debug')('app:routes:rentals');
const rentaldb = require('../models/rentals');
const Joi = require('../custom/joi');
const router = express.Router();

const rentalSchema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.array().required().items(
        Joi.objectId().required()
    )
}

function validateRental(input) {
    return Joi.validate(input,rentalSchema);
}

router.get('/', async (req, res) => {
    const rentals = await rentaldb.get();
    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    const rentals = await rentaldb.get(req.params.id);
    res.send(rentals);
});

router.post('/', async (req, res) => {
    const { error } = validateRental(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const rental = await rentaldb.set(req.body);
        res.send(rental);
    }
    catch(e) {
        res.status(400).send(e.message);
        debug(e);
    }
});

module.exports = router;