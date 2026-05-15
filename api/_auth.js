const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyTokenFromReq(req, res) {
    const header = req.headers?.authorization || req.headers?.Authorization;
    if (!header) {
        res.status(401).json({ message: 'No token provided' });
        return null;
    }

    const parts = header.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        console.error('JWT verification failed:', err && err.message ? err.message : err);
        res.status(403).json({ message: 'Invalid token' });
        return null;
    }
}

module.exports = { verifyTokenFromReq };
