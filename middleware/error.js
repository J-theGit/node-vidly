const debug = require('debug')('app:middleware:error');

function error(err, req, res, next) {
    debug(err);
    res.status(500).send('Internal error');
}

module.exports = error;