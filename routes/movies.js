const express = require('express');
const Joi = require('../custom/joi');
const debug = require('debug')('app:routes:movies');
const moviesdb = require('../models/movies');
const router = express.Router();

const createMovieSchema = {
    title: Joi.string().required().min(3).max(300),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(999),
    dailyRentalRate: Joi.number().min(0).max(999)
};

const updateMovieSchema = {
    title: Joi.string().min(3).max(300),
    genreId: Joi.objectId(),
    numberInStock: Joi.number().min(0).max(999),
    dailyRentalRate: Joi.number().min(0).max(999)
};

router.get('/', async (req, res) => {
    const movies = await moviesdb.get();
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const { error } = Joi.validate(req.params, {
        id: Joi.objectId().required()
    });
    if (error) return res.status(400).send(error.details[0].message);

    const movie = await moviesdb.get(req.params.id);
    if (!movie) return res.status(404).send('movie with this id was not found');

    res.send(movie);

});

router.post('/', async (req, res) => {
    const { error } = Joi.validate(req.body, createMovieSchema);
    if (error) return res.status(400).send(error.details[0].message);

    const movie = await moviesdb.set(req.body);
    if (!movie) return res.status(400).send('genre wasn\'t found');

    res.send(movie);

});

router.put('/:id', async (req, res) => {
    let { error } = Joi.validate(req.params, {
        id: Joi.objectId().required()
    });
    if (error) {
        debug('error');
        return res.status(400).send(error.details[0].message);
    }

    error = Joi.validate(req.body, updateMovieSchema).error;
    if (error) res.status(400).send(error.details[0].message);

    const movie = await moviesdb.update(req.params.id, req.body);
    if (movie.error) return res.status(404).send(movie.error);

    res.send(movie);
});

router.delete('/:id', async (req, res) => {
    const { error } = Joi.validate(req.params, {
        id: Joi.objectId().required()
    });
    if (error) return res.status(400).send(error.details[0].message);
    
    const movie = await moviesdb.delete(req.params.id);
    if (!movie) return res.status(404).send('movie with this id does not exist');
    res.send(movie);
    

});

module.exports = router;