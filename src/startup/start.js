const debug = require('debug')('app:index:start');
const port = process.env.PORT || 3000;
function server(app) {
    return app.listen(port, () => {
        debug(`listening on port ${port}`);
    });
}

module.exports = server;