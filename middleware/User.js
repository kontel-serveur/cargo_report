const {User} = require('../models')
const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')
const crypto = require('crypto')


const userAuth =  async(req, res, next)=>{
    //check header

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(StatusCodes.UNAUTHORIZED).json('Authentication invalid')
    }
    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = User.findOne({where:{id: payload.id}})
        req.user = user

        req.user = {
            id: payload.id,
            fullName: payload.fullName,
            email: payload.email,
            allowed: payload.allowed,
            admin: payload.admin
        }

        if(!req.user.allowed){
            res.status(StatusCodes.UNAUTHORIZED).redirect('/login');

        }else{
            next()
        }
    } catch (error) {
        
    }
}

module.exports = userAuth