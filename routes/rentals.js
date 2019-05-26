const express = require('express');
const rentaldb = require('../models/rentals');
const Joi = require('Joi');
const router = express.Router();

const rentalSchema = {
    customerId: Joi.string().required().min(3).max(255),
    movieId: Joi.array().required()
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
    catch (e) {
        res.status(400).send('movieId or customerId invalid');
    }
});

module.exports = router;