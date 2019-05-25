const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const debug = require('debug')('app:genres');
const config = require('config');

const router = express.Router();
const mongourl = config.get('mongo-endpoint') + '/vidly';

mongoose.connect(mongourl, { useNewUrlParser: true })
    .then(() => debug('connected to mongo'));

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    }
});

const Genres = mongoose.model('Genre', genreSchema);

async function getGenres() {
    return await Genres.find();
}

async function getGenre(id) {
    return await Genres.findById(id);
}

async function insertGenre(name) {
    const genre = new Genres();
    genre.name = name;
    return await genre.save();
}

async function updateGenre(id, name) {
    const genre = await Genres.findById(id);
    genre.name = name;
    return await genre.save();
    //return await Genres.findById(id);
}

async function deleteGenre(id) {
    return await Genres.findByIdAndRemove(id);
}

function validateGenre(input) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(input, schema);
}

router.get('/', async function(req, res) {
    try {
        const results = await getGenres();
        res.send(results);
    }
    catch (e) {
        debug(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const genre = await getGenre(req.params.id);
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
        const genre = await insertGenre(req.body.name);
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
        const genre = await updateGenre(req.params.id, req.body.name);
        res.send(genre);
    }
    catch (e) {
        res.status(404).send('genre couldn\'t be found');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const genre = await deleteGenre(req.params.id);
        if (!genre) return res.status(404).send('genre couldn\'t be found');
        res.send(genre);
    }
    catch (e) {
        res.status(404).send('genre couldn\'t be found');

    }
});

module.exports = router;