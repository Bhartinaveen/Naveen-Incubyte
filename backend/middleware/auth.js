const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secretkey');
        req.user = decoded; // Now includes username if we re-login
        next();
    } catch (ex) {
        if (ex.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        res.status(401).json({ message: 'Invalid token.' });
    }
};
