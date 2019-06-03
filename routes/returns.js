const express = require('express');
const debug = require('debug')('app:routes:returns');
const auth = require('../middleware/auth');
const rentals = require('../models/rentals');
const router = express.Router();

router.post('/:id', auth, async (req, res) => {
    const rental = await rentals.submit(req.params.id);
    if (!rental) return res.status(400).send('rental was already returned');

    res.send(rental);
});

module.exports = router;