const mongoose = require('mongoose');
const debug = require('debug')('app:mongo');
const config = require('config');

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

async function getGenres(id) {
    if (id) return await Genres.findById(id);
    return await Genres.find();
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


module.exports.get = getGenres;
module.exports.set = insertGenre;
module.exports.update = updateGenre;
module.exports.delete = deleteGenre;
