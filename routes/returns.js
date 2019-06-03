const express = require('express');
const debug = require('debug')('app:routes:returns');
const rentals = require('../models/rentals');
const router = express.Router();

router.post('/:id', async (req, res) => {
    const rental = await rentals.submit(req.params.id);
    res.status(200).send(rental);
});

module.exports = router;