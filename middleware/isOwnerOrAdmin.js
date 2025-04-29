module.exports = (req, res, next) => {
    if (req.user?.role === 'admin' || req.user?.userId === req.params.id) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Not authorized.' });
};