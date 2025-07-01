const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Creating an authentication middleware function
// This middleware will be used to protect routes that require authentication
// It checks for a valid JWT token in the request header and verifies the user's identity
// If the token is valid, it attaches the user information to the request object and calls the
// next middleware function. If the token is invalid or not provided, it returns an error response.
// This middleware can be used in routes that require user authentication, such as creating or updating properties

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not defined.');
            return res.status(500).json({ message: 'Internal server error.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Exporting the authMiddleware function so it can be used in other parts of the application
module.exports = authMiddleware;
