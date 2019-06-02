const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Genre = mongoose.model('Genre', genreSchema);

async function getGenres(id) {
    if (id) return await Genre.findById(id);
    return await Genre.find();
}

async function insertGenre(name) {
    const genre = new Genre();
    genre.name = name;
    return await genre.save();
}

async function updateGenre(id, name) {
    const genre = await Genre.findById(id);
    if (!genre) throw new Error('genre couldn\'t be found');

    genre.name = name;
    return await genre.save();
}

async function deleteGenre(id) {
    return await Genre.findByIdAndDelete(id);
}

module.exports.get = getGenres;
module.exports.set = insertGenre;
module.exports.update = updateGenre;
module.exports.delete = deleteGenre;
module.exports.Genre = Genre;