const mongoose = require('mongoose');
const debug = require('debug')('app:models:rentals');
const { Movie } = require('./movies');
const { Customer } = require('./customers');

const rentalSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    movie: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    }],
    dateOut: {
        type: Date,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

const Rental = mongoose.model('Rental', rentalSchema);

async function getRentals(id) {
    if (id) 
        return await Rental.findById(id)
        .populate('movie')
        .populate('customer');

    return await Rental.find()
        .populate('movie')
        .populate('customer');
}

async function createRental(obj) {
    const customer = await Customer.findById(obj.customerId);
    const movies = await getMovies(obj.movieId);
    if (!movies) throw new Error('one or more movies were not found');

    const rental = new Rental({
        customer: customer._id,
        movie: movies
    });
    debug('2', movies);
    return await rental.save();
}

async function getMovies(movies) {
    movies.forEach(async id => {
        try {
            const movie = await Movie.findById(id);
            if (!movie) {
                const i = movies.indexOf(id);
                verifiedMovies.splice(i, 1);
            }
        }
        catch(e) {
            return false;
        }
    });
    return await movies;
}

module.exports.get = getRentals;
module.exports.set = createRental;