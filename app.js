const express = require('express');
const morgan = require('morgan')('tiny');
const helmet = require('helmet');
const app = express();

const index = require('./routes/app');
const genres = require('./routes/genres');
const logger = require('./middleware/logger');

const port = process.env.PORT || 3000;

if (app.get('env') === 'development') app.use(morgan);

app.use(helmet());
app.use(express.json());
app.use(logger);
app.use('/', index);
app.use('/api/genres', genres);

app.set('view engine', 'pug');

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});