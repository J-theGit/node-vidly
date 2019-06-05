const express = require('express');
const app = express();

require('./startup/db');
require('./startup/validation');
require('./startup/debug')(app);
require('./startup/routes')(app);
const server = require('./startup/start')(app);
module.exports = server;