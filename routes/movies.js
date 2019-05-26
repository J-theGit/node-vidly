const express = require('express');
const Joi = require('../custom/joi');
const debug = require('debug')('app:routes:movies');
const moviesdb = require('../models/movies');
const router = express.Router();

const createMovieSchema = {
    title: Joi.string().required().min(3).max(300),
    genreId: Joi.string().required().min(3).max(50),
    numberInStock: Joi.number().min(0).max(999),
    dailyRentalRate: Joi.number().min(0).max(999)
};

const updateMovieSchema = {
    title: Joi.string().min(3).max(300),
    genreId: Joi.string().min(3).max(50),
    numberInStock: Joi.number().min(0).max(999),
    dailyRentalRate: Joi.number().min(0).max(999)
};

router.get('/', async (req, res) => {
    const movies = await moviesdb.get();
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    try {
        const movie = await moviesdb.get(req.params.id);
        if (!movie) return res.status(404).send('movie with this id was not found');
        res.send(movie);
    }
    catch(e) {
        res.status(404).send('movie with this id was not found');
    }
});

router.post('/', async (req, res) => {
    const { error } = Joi.validate(req.body, createMovieSchema);
    if (error) return res.status(400).send(error.details[0].message);
    try {
        const movie = await moviesdb.set(req.body);
        if (!movie) return res.status(400).send('genre wasn\'t found');
    
        res.send(movie);
    }
    catch (e) {
        res.status(400).send('genre wasn\'t found');
    }
});

router.put('/:id', async (req, res) => {
    const { error } = Joi.validate(req.body, updateMovieSchema);
    if (error) res.status(400).send(error.details[0].message);

    try {
        const movie = await moviesdb.update(req.params.id, req.body);
        if (!movie) return res.status(404).send('movie with this id was not found');
        res.send(movie);
    }
    catch(e) {
        res.status(404).send('movie or genre with provided id was not found');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const movie = await moviesdb.delete(req.params.id);
        if (!movie) return res.status(404).send('movie with this id does not exist');
        res.send(movie);
    }
    catch(e) {
        res.status(404).send('movie with this id does not exist');
    }
});

module.exports = router;