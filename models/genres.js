const mongoose = require('mongoose');

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
}

async function deleteGenre(id) {
    return await Genres.findByIdAndRemove(id);
}


module.exports.get = getGenres;
module.exports.set = insertGenre;
module.exports.update = updateGenre;
module.exports.delete = deleteGenre;
