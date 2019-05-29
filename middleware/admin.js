function admin(req, res, next) {
    if (!req.user.admin) return res.status(403).send('Unauthorized for this operation');
    next();
}

module.exports = admin;