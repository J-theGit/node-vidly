const auth = require('../middleware/auth');
const express = require('express');
const debug = require('debug')('app:routes:rentals');
const rentaldb = require('../models/rentals');
const Joi = require('joi');
const router = express.Router();

function validateRental(input) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.array().required().items(
            Joi.objectId().required()
        )
    }
    return Joi.validate(input, schema);
}
function validateId(input) {
    const schema = {
        id: Joi.objectId().required()
    }
    return Joi.validate(input, schema);
}
router.get('/', async (req, res) => {
    const rentals = await rentaldb.get();
    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.message);

    const rental = await rentaldb.get(req.params.id);
    if  (!rental) return res.status(404).send('Requested rental was not found');
    res.send(rental);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateRental(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const rental = await rentaldb.set(req.body);
        res.send(rental);
    }
    catch(e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;