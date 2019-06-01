const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug')('app:index:db');

const mongourl = config.get('mongo-endpoint') + '/vidly';
mongoose.connect(mongourl, { useNewUrlParser: true , useCreateIndex: true })
    .then(() => debug('connected to mongo'))

module.exports.mongourl = mongourl;