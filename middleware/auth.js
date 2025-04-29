const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access deneed' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Contenido del token:', verified); // Agrega este log
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};
