const debug = require('debug')('app:middleware:error');
const winston = require('winston');

function error(err, req, res, next) {
    res.status(500).send('Internal error');

    debug(err);
    if (err.message) winston.error(err.message,err);
    else winston.error(err);
}

module.exports = error;