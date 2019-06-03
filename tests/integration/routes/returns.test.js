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
    let movie;
    let movieId;
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

        movie = new Movie({
            title: 'movie',
            genre,
            numberInStock: 0,
            dailyRentalRate: 2.20
        });
        await movie.save();
        movieId = movie._id;

        rental = new Rental({
            customer,
            movie: [movie],
            dateOut: Date.now()-(60*60*24*7), // 7 days ago
            dateReturned: null,
            rentalFee: 0
        });
        await rental.save();
        rentalId = rental._id;
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany();
        await Customer.deleteMany();
        await Movie.deleteMany();
        await Genre.deleteMany();
    });

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

        it('should set rentalFee as 15.40 when valid return is made', async () => {
            const res = await exec();

            expect(res.body.rentalFee).toBeCloseTo(15.4);
        });

        it('should increase movie stock and return 1 when valid return is made', async () => {
            const movieBefore = await Movie.findById(movieId);
            expect(movieBefore.numberInStock).toBe(0);

            await exec();
            const movieAfter = await Movie.findById(movieId);

            expect(movieAfter.numberInStock).toBe(1);
        });

        it('should return the rental when valid return is made', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('customer', customer);
            expect(res.body).toHaveProperty('movie', [movie]);
            expect(res.body).toHaveProperty('dateOut');
            expect(res.body).toHaveProperty('dateReturned');
            expect(res.body).toHaveProperty('rentalFee');
        });
        
        it('should return 401 when client not logged in', async () => {
            token = 1;
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
