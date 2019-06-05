const debug = require('debug')('app:tests:routes:returns');
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../../models/users');
const { Rental } = require('../../../models/rentals');
const { Customer } = require('../../../models/customers');
const { Movie } = require('../../../models/movies');
const { Genre } = require('../../../models/genres');


describe('/api/returns', () => {
    let server;
    let token;
    let customer;
    let movie1;
    let movie2;
    let movie1Id;
    let movie2Id;
    let genre;
    let rental;
    let rentalId;
    
    beforeEach(async () => {
        server = require('../../../src/index');
        token = new User().generateToken();

        // inserting to db before test
        customer = new Customer({
            isGold: false,
            name: 'name',
            phone: 12345678
        });
        await customer.save();

        genre = new Genre({
            name: 'genre'
        });
        await genre.save();

        movie1 = new Movie({
            title: 'movie1',
            genre,
            numberInStock: 0,
            dailyRentalRate: 2.20
        });
        await movie1.save();
        movie1Id = movie1._id.toHexString();

        movie2 = new Movie({
            title: 'movie2',
            genre,
            numberInStock: 0,
            dailyRentalRate: 1.20
        });
        await movie2.save();
        movie2Id = movie2._id.toHexString();

        await setmovies(1);
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany();
        await Customer.deleteMany();
        await Movie.deleteMany();
        await Genre.deleteMany();
    });

    async function setmovies(numMovies) {
        await Rental.deleteMany();
        rental = new Rental({
            customer,
            dateOut: Date.now()-(60*60*24*7), // 7 days ago
            dateReturned: null,
            rentalFee: 0
        });
        rental.movie = (numMovies === 1) ? [movie1] : [movie1, movie2];
        await rental.save();
        rentalId = rental._id;
    }

    function exec() {
        return request(server)
            .post('/api/returns/' + rentalId)
            .set('x-auth-token', token)
    }
    
    describe('POST /:id', () => {
        it('should return 200 when valid return is made', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should set dateReturned as current date when valid return is made', async () => {
            await exec();
            const returns = await Rental.findById(rentalId);

            expect(returns.dateReturned).not.toBeNull();
        });

        it('should set rentalFee as 15.40 when valid return is made with 1 movie', async () => {
            const res = await exec();
            const rental = await Rental.findById(rentalId);

            expect(res.body.rentalFee).toBeCloseTo(15.4);
            expect(rental.rentalFee).toBeCloseTo(15.4);
        });

        it('should set rentalFee as 23.80 when valid return is made with 2 movies', async () => {
            await setmovies(2);
            const res = await exec();
            const rental = await Rental.findById(rentalId);

            expect(res.body.rentalFee).toBeCloseTo(23.8);
            expect(rental.rentalFee).toBeCloseTo(23.8);
        });

        it('should increase movie stock and return 1 when valid return is made for 1 movie', async () => {
            const movieBefore = await Movie.findById(movie1Id);
            expect(movieBefore.numberInStock).toBe(0);

            await exec();
            const movieAfter = await Movie.findById(movie1Id);

            expect(movieAfter.numberInStock).toBe(1);
        });

        it('should increase movie stock and return 1 when valid return is made for 2 movies', async () => {
            await setmovies(2);
            const movie1Before = await Movie.findById(movie1Id);
            const movie2Before = await Movie.findById(movie2Id);

            expect(movie1Before.numberInStock).toBe(0);
            expect(movie2Before.numberInStock).toBe(0);

            await exec();
            const movie1After = await Movie.findById(movie1Id);
            const movie2After = await Movie.findById(movie2Id);

            expect(movie1After.numberInStock).toBe(1);
            expect(movie2After.numberInStock).toBe(1);
        });

        it('should return the rental when valid return is made', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('customer', customer._id.toHexString());
            expect(res.body).toHaveProperty('movie', [movie1Id]);
            expect(res.body).toHaveProperty('dateOut');
            expect(res.body).toHaveProperty('dateReturned');
            expect(res.body).toHaveProperty('rentalFee');
        });
        
        it('should return 401 when client not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });
        
        it('should return 400 when rental return was already processed', async () => {
            await exec();
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 when id is invalid format', async () => {
            rentalId = '1';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 when id is not found', async () => {
            rentalId = mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(404);
        });
    });
});
