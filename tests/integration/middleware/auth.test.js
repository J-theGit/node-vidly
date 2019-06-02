const debug = require('debug')('app:tests:middleware:auth');
const { User } = require('../../../models/users');
const { Genre } = require('../../../models/genres');
const request = require('supertest');

let server;

describe('auth middleware', () => {
    let token;
    function exec() {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1'});
    }

    beforeEach(async () => {
        server = require('../../../src/index');
        token = new User({ admin: true }).generateToken();
    });
    
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany();
    });

    it('should delegate to genre router if token is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('genre1');
    });

    it('should return 401 if token is falsy', async () => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });
    
    it('should return 400 if token is invalid', async () => {
        token = '1';
        const res = await exec();

        expect(res.status).toBe(400);
    });

});