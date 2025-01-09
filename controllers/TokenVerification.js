const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors');
const {User} = require('../models');

const tokenVerification = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    const headerToken = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(headerToken, process.env.JWT_SECRET);

        // Fetch user from the database
        const user = await User.findOne({ where: { id: payload.id } });

        if (!user) {
            console.log('User not found');
            return res.status(StatusCodes.NOT_FOUND).json({ token: false, user: null });
        }

        // Return token validity and user admin status
        console.log('Valid token');
        return res.status(StatusCodes.OK).json({
            token: true,
            user: {
                id: user.id,
                email: user.email,
                admin: user.admin, // Include admin status
            },
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json('Unauthorized');
    }
};

module.exports = { tokenVerification };
