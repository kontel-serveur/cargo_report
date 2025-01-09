const {Cargo, User} = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const {StatusCodes} = require('http-status-codes')

const getCargoData = async(req, res) =>{
    try {
        const cargoData = await Cargo.findAll()
        
        const cargoWithUser = await Promise.all(cargoData.map(async (cargo) => {
            const user = await User.findByPk(cargo.addedBy);  // Get user based on addedBy (user ID)
            return {
                ...cargo.toJSON(),  // Convert Cargo to JSON to make it plain object
                userFullName: user ? user.fullName : null,  // Add user full name (or any other field)
            };
        }));

        // Return the response with user names added to cargo data
        return res.status(StatusCodes.OK).json({ cargoData: cargoWithUser });
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('Error fetching data')
    }
}


const getSingleCargoData = async(req, res)=>{
    try {
        const id  = req.params.id
      const cargo = await Cargo.findOne({where: {id: id}})

      if (cargo) {
        // Get user data based on 'addedBy' field in cargoData
        const user = await User.findByPk(cargo.addedBy);  // Get user based on addedBy (user ID)
    
        // Add the user full name (or other fields) to the cargoData
        const cargoData = {
            ...cargo.toJSON(),  // Convert Cargo to JSON to make it plain object
            userFullName: user ? user.fullName : null,  // Add user full name (or any other field)
        };
    
        return res.status(StatusCodes.OK).json({ cargoData });
    } else {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Cargo not found" });
    }
        
    } catch (error) {
        console.log(error)
    }
}

const cargoUpdate = async(req, res)=>{
    try {
        const id = req.params.id
        const cargo = await Cargo.findOne({where: {id: id}})

        if (cargo){
            await Cargo.update({
                numeroDeTransit: req.body.numeroDeTransit,
            numeroDeBalise: req.body.numeroDeBalise,
            codeHS: req.body.codeHS,
            corridor: req.body.corridor,
            typeDeVehicule: req.body.typeDeVehicule,
            immatriculation: req.body.immatriculation,
            transitaire: req.body.transitaire,
            chauffeur: req.body.chauffeur,
            telephone: req.body.telephone,
            creationDate: req.body.creationDate,
            creationHeureDebut: req.body.creationHeureDebut,
            creationHeureFin: req.body.creationHeureFin,
            alarme: req.body.alarme,
            clotureDate: req.body.clotureDate,
            clotureHeure: req.body.clotureHeure,
            clotureLieu: req.body.clotureLieu,
            clotureMode: req.body.clotureMode,
            duree: req.body.duree,
            }, {where: {id, id}})
            
            return res.status(StatusCodes.OK).json('Cargo updated successfully')
        }else{
            return res.status(StatusCodes.NOT_FOUND).json('Cargo not found')
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('Bad request')
    }
}

const getUser = async(req, res)=>{
    try {
        const users = await User.findAll()
        return res.status(StatusCodes.OK).json({users})
    } catch (error) {
        console.log(error)
    }
}

const getSingleUser = async(req, res)=>{
    try {
        const id = req.params.id
        const user = await User.findOne({where: {id: id}})
        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        console.log(error)
    }
}


const registerUser = async(req, res)=>{
    try {
        const existingUser = await User.findOne({where: {email: req.body.email}})
        const hashedPassword = bcrypt.hashSync(req.body.password, 12);

        if(existingUser){
            res.status(StatusCodes.CONFLICT).json('Email already in use!')
        }else{
            if (req.body.password===req.body.confirm_password){
                await User.create({
                    fullName: req.body.fullName,
                    email: req.body.email,
                    allowed: req.body.allowed,
                    admin: req.body.admin,
                    password: hashedPassword,
                })

                res.status(StatusCodes.CREATED).json('User created successfully!')
            }else{
                res.status(StatusCodes.BAD_REQUEST).json('Passwords do not match')
            }

            
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('Bad request')
    }
}

const updateUser = async(req, res)=>{
    try {
        const id = req.params.id
        const user = await User.findOne({where: {id: id}})
        if(user){
            await User.update({fullName: req.body.fullName, email: req.body.email, allowed: req.body.allowed, admin: req.body.admin}, {where:{
                id: id
            }})
            return res.status(StatusCodes.OK).json('Details mis a jour avec succes')
        }else{
            return res.status(StatusCodes.NOT_FOUND).json('User not found')
        }
        
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('An error has occured')
    }
}

const updateUserPassword = async(req, res)=>{
    try {
        const id = req.params.id
        const user = await User.findOne({where:{id: id}})
        if(user){
 
                if(req.body.password === req.body.confirmPassword){
                    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
                    await User.update({password: hashedPassword}, {where:{
                    id: id
                }})

                console.log('Password updated successfully')
                return res.status(StatusCodes.OK).json('Mot de passe mis a jour avec success')
                }else{
                    console.log('Passwords do not macth')
                    return res.status(StatusCodes.BAD_REQUEST).json('Passwords do not match')
                }
           
        }else{
            console.log('User does not exist')
            return res.status(StatusCodes.NOT_FOUND).json('User does not exist')
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('An error has occured')
    }
}

const profileUpdate = async(req, res)=>{
    try {
        const user = await User.findOne({where: {id: req.user.id}, attributes: { exclude: ['password', 'allowed', 'admin'] } })
        if(user){
            await User.update({fullName: req.body.fullName, email: req.body.email}, {where:{
                id: req.user.id
            }})
            return res.status(StatusCodes.OK).json('Profile updated successfully')
        }else{
            return res.status(StatusCodes.NOT_FOUND).json('User not found')
        }
        
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('An error has occured')
    }
}

const passwordChange = async(req, res)=>{
    try {
        const user = await User.findOne({where:{id: req.user.id}})
        if(user){
            const password = req.body.currentPassword
            const isPasswordRight = bcrypt.compareSync(password, user.password)

            if(isPasswordRight){
                if(req.body.password === req.body.confirmPassword){
                    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
                    await User.update({password: hashedPassword}, {where:{
                    id: req.user.id
                }})

                console.log('Password updated successfully')
                return res.status(StatusCodes.OK).json('Password updated successfully')
                }else{
                    console.log('Passwords do not macth')
                    return res.status(StatusCodes.BAD_REQUEST).json('Passwords do not match')
                }
            }else{
                console.log('Invalid password')
                return res.status(StatusCodes.NOT_FOUND).json('Invalid password')
            }
        }else{
            console.log('User does not exist')
            return res.status(StatusCodes.NOT_FOUND).json('User does not exist')
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json('An error has occured')
    }
}

module.exports = {getCargoData, getSingleCargoData, getUser, getSingleUser, registerUser, updateUser, updateUserPassword, profileUpdate, passwordChange, cargoUpdate}