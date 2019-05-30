const express = require('express');
const morgan = require('morgan')('tiny');
const helmet = require('helmet');
const config = require('config');
const debug = require('debug')('app:core');
const mongoose = require('mongoose');

const app = express();

const index = require('../routes/app');
const genres = require('../routes/genres');
const customers = require ('../routes/customers');
const movies = require('../routes/movies');
const rentals = require('../routes/rentals');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');

const port = process.env.PORT || 3000;

const mongourl = config.get('mongo-endpoint') + '/vidly';
mongoose.connect(mongourl, { useNewUrlParser: true , useCreateIndex: true })
    .then(() => debug('connected to mongo'))
    .catch(e => debug(e));

debug(`
App: ${config.get('app-name')}
Env: ${config.get('environment')}
Auth location used: ${config.get('private-key')}`);

if (app.get('env') === 'development') app.use(morgan);

app.use(helmet());
app.use(express.json());
app.use('/', index);
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use(error);

app.set('view engine', 'pug');

app.listen(port, () => {
    debug(`listening on port ${port}`);
});