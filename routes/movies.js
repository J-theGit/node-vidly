const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const Joi = require('joi');
const debug = require('debug')('app:routes:movies');
const moviesdb = require('../models/movies');
const router = express.Router();

function validateCreateMovie(input) {
    const schema = {
        title: Joi.string().required().min(3).max(300),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).max(999),
        dailyRentalRate: Joi.number().min(0).max(999)
    }
    return Joi.validate(input, schema);
}

function validateUpdateMovie(input) {
    const schema = {
        title: Joi.string().min(3).max(300),
        genreId: Joi.objectId(),
        numberInStock: Joi.number().min(0).max(999),
        dailyRentalRate: Joi.number().min(0).max(999)
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
    const movies = await moviesdb.get();
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    const movie = await moviesdb.get(req.params.id);
    if (!movie) return res.status(404).send('movie with this id was not found');

    res.send(movie);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateCreateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const movie = await moviesdb.set(req.body);
        res.send(movie);
    }
    catch(e) {
        res.status(400).send(e.message)
    }
});

router.put('/:id', auth, async (req, res) => {
    let { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    error = validateUpdateMovie(req.body).error;
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const movie = await moviesdb.update(req.params.id, req.body);
        if (movie.error) return res.status(404).send(movie.error);
    
        res.send(movie);
    }
    catch(e) {
        res.status(400).send(e.message);
    }
});

router.delete('/:id', auth, admin, async (req, res) => {
    const { error } = validateId(req.params);
    if (error) return res.status(400).send(error.details[0].message);
    
    try{
        const movie = await moviesdb.delete(req.params.id);
        if (!movie) return res.status(404).send('movie with this id does not exist');
        
        res.send(movie);
    }
    catch(e) {
        res.status(500).send('Internal error occured, movie wasn\'t inserted');
    }
});

module.exports = router;