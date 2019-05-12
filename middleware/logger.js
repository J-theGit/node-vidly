const debug = require('debug')('app:req');

function logger(req, res, next) {
    debug('request received');
    next();
}

module.exports = logger;