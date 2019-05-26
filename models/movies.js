const mongoose = require('mongoose');
const { Genre } = require('./genres');
const debug = require('debug')('app:models:movies');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    }
});

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        default: 0
    },
    dailyRentalRate: {
        type: Number,
        default: 0
    }
});

const Movie = mongoose.model('Movie', movieSchema);

async function getMovies(id) {
    if (id) return await Movie.findById(id);
    return await Movie.find().sort('name');
}

async function insertMovies(obj) {
    const genre = await Genre.findById(obj.genreId);
    if (!genre) return false;

    const movie = new Movie({
        title: obj.title,
        genre: new Genre({ 
            _id: genre._id,
            name: genre.name 
        }),
        numberInStock: obj.numberInStock,
        dailyRentalRate: obj.dailyRentalRate
    });
    return await movie.save();
}

async function updateMovie(id, obj) {
    const movie = await Movie.findById(id);
    if (!movie) return { error: 'movie wasn\'t found'};

    if (obj.genreId) {
        const genre = await Genre.findById(obj.genreId);
        if (!genre) return { error: 'genre wasn\'t found'};

        movie.genre._id = genre._id;
        movie.genre.name = genre.name;
    }
    
    movie.title = obj.title ? obj.title : movie.title;
    movie.numberInStock = obj.numberInStock ? obj.numberInStock : movie.numberInStock;
    movie.dailyRentalRate = obj.dailyRentalRate ? obj.dailyRentalRate : movie.dailyRentalRate;


    return await movie.save();
}

async function deleteMovie(id) {
    return await Movie.findByIdAndDelete(id);
}
module.exports.get = getMovies;
module.exports.set = insertMovies;
module.exports.update = updateMovie;
module.exports.delete = deleteMovie;
module.exports.Movie = Movie;