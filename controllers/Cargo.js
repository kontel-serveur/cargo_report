const {Cargo} = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const {StatusCodes} = require('http-status-codes')

const handleSequelizeError = (error) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const uniqueError = error.errors[0];
      return `The value "${uniqueError.value}" for the field "${uniqueError.path}" must be unique.`;
    }
  
    if (error.name === 'SequelizeValidationError') {
      return error.errors.map(err => err.message).join(', ');
    }
  
    if (error.original?.code === 'ER_DUP_ENTRY') {
      return `Duplicate entry detected: ${error.original.sqlMessage}`;
    }
  
    return `An error occurred: ${error.message}`;
  };


const cargoRegistration = async(req, res)=> {

    try {
       const cargo =  await Cargo.create({
            numeroDeTransit: req.body.numeroDeTransit,
            numeroDeBalise: req.body.numeroDeBalise,
            codeHS: req.body.codeHS,
            corridor: req.body.corridor,
            typeDeVehicule: req.body.typeDeVehicule,
            immatriculation: req.body.immatriculation,
            transitaire: req.body.transitaire,
            chauffeur: req.body.chauffeur,
            telephone: req.body.transitaire,
            creationDate: req.body.creationDate,
            creationHeureDebut: req.body.creationHeureDebut,
            creationHeureFin: req.body.creationHeureFin,
            alarme: req.body.alarme,
            clotureDate: req.body.clotureDate,
            clotureHeure: req.body.clotureHeure,
            clotureLieu: req.body.clotureLieu,
            clotureMode: req.body.clotureMode,
            duree: req.body.duree,
            addedBy: req.user.id
        })

        return res.status(StatusCodes.OK).json({cargo})
    } catch (error) {
        console.log(error)
        const errorMessage = handleSequelizeError(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
}

const getMyCargoData = async(req, res) =>{
    try {
        const cargoData = await Cargo.findAll({where: {addedBy: req.user.id}})

        return res.status(StatusCodes.OK).json({cargoData})
    } catch (error) {
        console.log(error)
    }
}

const getMySingleCargoData = async(req, res)=>{
  try {
      const id  = req.params.id
      const cargoData = await Cargo.findAll({where: {addedBy: req.user.id, id: id}})

        return res.status(StatusCodes.OK).json({cargoData})
  } catch (error) {
    console.log(error)
  }
}

module.exports = {cargoRegistration, getMyCargoData, getMySingleCargoData}