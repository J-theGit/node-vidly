const express = require('express');
const genredb = require('../models/genres');
const Joi = require('joi');
const debug = require('debug')('app:routes:genres');

const router = express.Router();

function validateGenre(input) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(input, schema);
}

router.get('/', async function(req, res) {
    try {
        const results = await genredb.get();
        res.send(results);
    }
    catch (e) {
        debug(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const genre = await genredb.get(req.params.id);
        if (!genre) return res.status(404).send('genre couldn\'t be found');
        res.send(genre);
    }
    catch (e) {
        res.status(404).send('genre couldn\'t be found');
    }
});

router.post('/', async (req, res) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    try {
        const genre = await genredb.set(req.body.name);
        res.send(genre);
    }
    catch (e) {
        debug(e);
        return res.status(500).send('unable to insert genre');
    }
});

router.put('/:id', async (req, res) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const genre = await genredb.update(req.params.id, req.body.name);
        res.send(genre);
    }
    catch (e) {
        res.status(404).send('genre couldn\'t be found');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const genre = await genredb.delete(req.params.id);
        if (!genre) return res.status(404).send('genre couldn\'t be found');
        res.send(genre);
    }
    catch (e) {
        res.status(404).send('genre couldn\'t be found');

    }
});

module.exports = router;