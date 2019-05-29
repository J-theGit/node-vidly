const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const genredb = require('../models/genres');
const Joi = require('../custom/joi');
const debug = require('debug')('app:routes:genres');
const router = express.Router();


function validateGenre(input) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(input, schema);
}

function validateId(input) {
    const schema = {
        id: Joi.objectId().required()
    }
    return Joi.validate(input, schema);
}

router.get('/', async function(req, res) {
    const results = await genredb.get();
    res.send(results);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await genredb.get(req.params.id);
    if (!genre) return res.status(404).send('genre couldn\'t be found');
    res.send(genre);
});

router.post('/', auth, admin, async (req, res) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    try {
        const genre = await genredb.set(req.body.name);
        res.send(genre);
    }
    catch (e) {
        res.status(500).send('Internal error occured, genre wasn\'t inserted');
    }
});

router.put('/:id', auth, admin, async (req, res) => {
    let { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    error = validateId(req.params).error;
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const genre = await genredb.update(req.params.id, req.body.name);
        res.send(genre);
    }
    catch (e) {
        res.status(404).send(e.message);
    }
});

router.delete('/:id', auth, admin, async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    try{
        const genre = await genredb.delete(req.params.id);
        if (!genre) return res.status(404).send('genre couldn\'t be found');
    
        res.send(genre);
    }
    catch(e) {
        res.status(500).send('Internal error occured, genre wasn\'t deleted');
    }
});

module.exports = router;