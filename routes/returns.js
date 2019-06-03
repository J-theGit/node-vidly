const express = require('express');
const debug = require('debug')('app:routes:returns');
const router = express.Router();

router.post('/:id', (req, res) => {
    res.status(200).send();
});

module.exports = router;