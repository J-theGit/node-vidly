function admin(req, res, next) {
    if (!req.user.admin) return res.status(401).send('Unauthorized for this operation');
    next();
}

module.exports = admin;