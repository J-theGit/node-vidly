const debug = require('debug')('app:core');
const winston = require('winston');
const morgan = require('morgan')('tiny');

require('winston-mongodb');
require('express-async-errors');

const config = require('config');
const { mongourl } = require('./db');

winston.add(new winston.transports.File({ filename: 'app.log' }));
winston.add(new winston.transports.MongoDB({ db: mongourl, level: 'error' }));


process.on('uncaughtException', e => {
    debug(e);
    winston.error(e.message);
    process.exit(1);
});
process.on('unhandledRejection', e => {
    debug(e);
    winston.error(e.message);
    process.exit(1);
});

debug(`
App: ${config.get('app-name')}
Env: ${config.get('environment')}
Auth location used: ${config.get('private-key')}`);

function setUpMorgan(app) {
    if (app.get('env') === 'development') app.use(morgan);
}
module.exports = setUpMorgan;