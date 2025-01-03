const {User} = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const {StatusCodes} = require('http-status-codes')


const userRegistration = async(req, res)=>{
    try {
        const existingUser = await User.findOne({where: {email: req.body.email}})
        const hashedPassword = bcrypt.hashSync(req.body.password, 12);

        if(existingUser){
            res.status(StatusCodes.CONFLICT).json('Email already in use!')
        }else{
            await User.create({
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
            })

            res.status(StatusCodes.CREATED).json('User created successfully!')
        }
    } catch (error) {
        console.log(error)
    }
}

const userLogin = async(req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({where:{email: email}})

        if(!user){
            res.status(StatusCodes.NOT_FOUND).json('Invalid email or password!')
        }

        const isPasswordRight = bcrypt.compareSync(password, user.password)

        if(!isPasswordRight){
            res.status(StatusCodes.NOT_FOUND).json('Invalid email or password!')
        }else{

                const token = jwt.sign({
                id: user.id,
                fullName:  user.fullName,
                email: user.email,
                admin: user.admin,
                allowed: user.allowed
               
            }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})

            return res.status(StatusCodes.OK).json({user:{
               id: user.id,
                fullName:  user.fullName,
                email: user.email,
                admin: user.admin,
                allowed: user.allowed
            }, token})
            

            
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('An error has occured')
    }
}

module.exports = {userRegistration, userLogin}
