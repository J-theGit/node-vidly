const debug = require('debug')('app:tests:routes:genres');
const mongoose = require('mongoose');
const { Genre } = require('../../../models/genres');
const { User } = require('../../../models/users');
const request = require('supertest');

let server;

describe('/api/genres', () => {

    beforeEach(() => {
        server = require('../../../src/index');
    });

    afterEach(async () => {
        await Genre.deleteMany();
        server.close();
    });

    describe('GET /', () => {
        it('responds with genres', async () => {
            await Genre.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);
            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].name).toBe('genre1');
            expect(res.body[1].name).toBe('genre2');
        });
    });

    describe('GET /:id', () => {
        it('should return 400 with invalid id format', async () => {
            await Genre.insertMany([
                { _id:new mongoose.Types.ObjectId(), name: 'genre1' },
                { _id:new mongoose.Types.ObjectId(), name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres/123');

            expect(res.status).toBe(400);
        });

        it('should return 404 with id that doesnt exist', async () => {
            const testId = new mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/'+testId);

            expect(res.status).toBe(404);
        });

        it('should return 200 and genre based on valid and existing id', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get('/api/genres/'+genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ _id:genre._id.toHexString(), name:genre.name });
        });
    });

    describe('POST /', () => {
        let token;
        let name;
        async function exec() {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User({ admin: true }).generateToken();
            name = 'genre1';
        });

        it('should return 401 when unauthorised', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 403 when unauthorised', async () => {
            token = new User({ admin: false }).generateToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 400 for empty body', async () => {
            name = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 for genre name in 4 chars', async () => {
            name = 'aaaa';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 for genre name in 51 chars', async () => {
            name = Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 200 when authorised and valid body', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('genre1');
        });

        it('should return save to database when authorised and valid body', async () => {
            const res = await exec();
            const find = await Genre.findById(res.body._id);
    
            expect(find.name).toBe('genre1');
        });
    });
});

