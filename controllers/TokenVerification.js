const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')
const {UnauthenticatedError} = require('../errors')
const User = require('../models/User')


const tokenVerification = async(req, res)=>{
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    const headerToken = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(headerToken, process.env.JWT_SECRET);
        
        if(payload._id===req.user._id){
            console.log('Valid')
            res.status(StatusCodes.OK).json({token: true})
        }else{
            console.log('Not Valid')
            res.status(StatusCodes.NOT_FOUND).json({token: false})
        }
        

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.UNAUTHORIZED).json('Unauthorized');
    }
}

module.exports = {tokenVerification}