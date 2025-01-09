const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const adminAuth = async (req, res, next) => {
    // Check header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database
        const user = await User.findOne({ where: { id: payload.id } });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }

        // Attach user data to the request
        req.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            allowed: user.allowed,
            admin: user.admin,
        };

        // Check if the user is allowed and is an admin
        if (!req.user.allowed) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Access denied' });
        }

        if (!req.user.admin) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Admin privileges required' });
        }

        next();
    } catch (error) {
        console.error(error);
     //   return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
    }
};

module.exports = adminAuth;
