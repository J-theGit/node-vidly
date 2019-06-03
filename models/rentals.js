const mongoose = require('mongoose');
const debug = require('debug')('app:models:rentals');
const { Movie } = require('./movies');
const { Customer } = require('./customers');
const Fawn = require('fawn');
Fawn.init(mongoose);

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
    if (!customer) throw new Error('customer not found');

    const movies = await getMovies(obj.movieId);
    const rental = new Rental({
        customer: customer._id,
        movie: obj.movieId
    });

    try {
        const task = new Fawn.Task()
            .save('rentals', rental);

        for (movie of movies) 
            task.update('movies', { _id:movie._id }, 
            { 
                $inc: { numberInStock: -1 } 
            });

        await task.run();
    }
    catch (e) {
        throw new Error('Rental was not saved, something went wrong');
    }

    return await rental;
}

async function getMovies(movies) {
    const result = [];
    for await (id of movies) {
        const movie = await Movie.findById(id);
        if (!movie) throw new Error('one or more movies were not found');
        if (movie.numberInStock < 1) throw new Error(`movie ${movie._id} is out of stock`);
        result.push(movie);
    }
    return result;
}

async function returnRental(id) {
    const rental = await Rental.findById(id);
    rental.dateReturned = Date.now();
    return await rental.save();
}

module.exports.get = getRentals;
module.exports.set = createRental;
module.exports.submit = returnRental;
module.exports.Rental = Rental;