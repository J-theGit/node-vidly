const debug = require('debug');
const port = process.env.PORT || 3000;

function start(app) {
    app.listen(port, () => {
        debug(`listening on port ${port}`);
    });
}

module.exports = start;