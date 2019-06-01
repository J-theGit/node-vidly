const express = require('express');
const app = express();

require('./startup/db');
require('./startup/validation');
require('./startup/debug')(app);
require('./startup/routes')(app);
require('./startup/start')(app);