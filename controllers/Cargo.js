const {Cargo, DepassementDelai, CableDeverouille, CasSuspect} = require('../models')
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

      const existingCargo = await Cargo.findOne({where: {numeroDeBalise: req.body.numeroDeBalise}})

      if (existingCargo){
        const cargo =  await Cargo.create({
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
          addedBy: req.user.id
      })

      return res.status(StatusCodes.OK).json('Le numero de balise a ete utilise sur un autre camion, Veuillez ajouter un commentaire')
      }else{
        const cargo =  await Cargo.create({
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
          addedBy: req.user.id
      })

      return res.status(StatusCodes.OK).json('Transit enregistre avec success')
      }

       
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
      const depassementDelai = await DepassementDelai.findAll({where: {cargo: id}})
      const cableDeverouille = await CableDeverouille.findAll({where: {cargo: id}})

        return res.status(StatusCodes.OK).json({cargoData, depassementDelai, cableDeverouille})
  } catch (error) {
    console.log(error)
  }
}

const depassementDelaiRegistration = async(req, res)=>{
  try {
    const id = req.params.id
    const depassement_delai = await DepassementDelai.create({
      cargo: id,
      observation: req.body.observation
    })

    return res.status(StatusCodes.OK).json({depassement_delai})
  } catch (error) {
    console.log(error)
    return res.status(StatusCodes.BAD_REQUEST).json('Erreur de creation du delai de depassement')
  }
}

const cableDeverouilleRegistration = async(req, res)=>{
  try {
    const id = req.params.id
    const cable = await CableDeverouille.findOne({where: {cargo: id}})

    if (cable){
      return res.status(StatusCodes.BAD_REQUEST).json('Donnee deja enregistree')
    }else{
      const cableDeverouille = await CableDeverouille.create({
        cargo: id,
        dateCoupure: req.body.dateCoupure,
        heureCoupure: req.body.heureCoupure
      })
  
      return res.status(StatusCodes.OK).json({cableDeverouille})
    }
    
  } catch (error) {
    console.log(error)
    return res.status(StatusCodes.BAD_REQUEST).json('Erreur de creation du cable deverouille')
  }
}

const casSupectRegistration = async(req, res)=>{
  try {
    const id = req.params.id
    const cas = await CasSuspect.findOne({where: {cargo: id}})
    if(cas){
      return res.status(StatusCodes.BAD_REQUEST).json('Donnee deja enregistree')
    }else{
      const casSupect = await CasSuspect.create({
        cargo: id,
        commentaire: req.body.commentaire
      })
  
      return res.status(StatusCodes.OK).json({casSupect})
    }
    
  } catch (error) {
    console.log(error)
    return res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

module.exports = {cargoRegistration, getMyCargoData, getMySingleCargoData, depassementDelaiRegistration, cableDeverouilleRegistration, casSupectRegistration}