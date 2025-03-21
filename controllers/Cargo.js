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
      
      const existingCargo = await Cargo.findOne({where: {numeroDeBalise: req.body.numeroDeBalise, clotureDate: null}})

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
          creationDateFin: req.body.creationDateFin,
          creationHeureFin: req.body.creationHeureFin,
          alarme: req.body.alarme,
          clotureDate: req.body.clotureDate,
          clotureHeure: req.body.clotureHeure,
          clotureLieu: req.body.clotureLieu,
          clotureMode: req.body.clotureMode,
          duree: req.body.duree,
          addedBy: req.user.id
      })

      const casSupect = await CasSuspect.create({
        cargo: cargo.id,
        //commentaire: req.body.commentaire
        commentaire: "Le numero de balise a ete utilise sur un autre camion toujours en cour de transit"
      })

      return res.status(StatusCodes.OK).json('Transit enregistre avec success. Le numero de balise a ete utilise sur un autre camion toujours en cour de transit')
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
          creationDateFin: req.body.creationDateFin,
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
       // const cargoData = await Cargo.findAll({where: {addedBy: req.user.id}})
       const cargoData = await Cargo.findAll()

        return res.status(StatusCodes.OK).json({cargoData})
    } catch (error) {
        console.log(error)
    }
}

const getMySingleCargoData = async(req, res)=>{
  try {
      const id  = req.params.id
      //const cargoData = await Cargo.findAll({where: {addedBy: req.user.id, id: id}})
      const cargoData = await Cargo.findAll({where: {id: id}})
      const depassementDelai = await DepassementDelai.findAll({where: {cargo: id}})
      const cableDeverouille = await CableDeverouille.findAll({where: {cargo: id}})

        return res.status(StatusCodes.OK).json({cargoData, depassementDelai, cableDeverouille})
  } catch (error) {
    console.log(error)
  }
}

const updateCargoData = async(req, res)=>{
  try {
    const id  = req.params.id
    const cargoData = await Cargo.findOne({where: {id: id}})

    if (cargoData){
      await Cargo.update({numeroDeTransit: req.body.numeroDeTransit,
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
        creationDateFin: req.body.creationDateFin,
        creationHeureFin: req.body.creationHeureFin,
        alarme: req.body.alarme
      }, {where: {id: id}})
        return res.status(StatusCodes.OK).json('Transit mis a jour avec success!')
    }else{
      return res.status(StatusCodes.NOT_FOUND).json('Cargo not found')
    }
  } catch (error) {
    console.log(error)
  }
}

const deleteCargo = async(req, res)=>{
  try {
    const id = req.params.id
    const cargoData = await Cargo.findOne({where: {id: id, clotureDate: null}})

    if(cargoData){
      await Cargo.destroy({ where: { id: id, clotureDate: null } });

      return res.status(StatusCodes.OK).json("Cargo deleted successfully");
    }else{
      return res.status(StatusCodes.NOT_FOUND).json('Not found!')
    }

  } catch (error) {
    console.log(error)
  }
}

const addAlarme = async(req, res) =>{
  try {
    const id = req.params.id
    //const cargo = await Cargo.findOne({where: {addedBy: req.user.id, id: id}})
    const cargo = await Cargo.findOne({where: {id: id}})

    if(cargo){
        const alarme = {...cargo.alarme, alarme: req.body.alarme}
        const existingAlarme = Array.isArray(cargo.alarme) ? cargo.alarme : [];
        const newAlarme = Array.isArray(req.body.alarme) ? req.body.alarme : [];
        const updatedAlarme = [...existingAlarme, ...newAlarme];
        console.log(newAlarme)
        
      //  await Cargo.update({alarme: updatedAlarme}, {where:{id:id, addedBy: req.user.id}})
      await Cargo.update({alarme: updatedAlarme}, {where:{id:id}})

     /* const delaiAlarm = newAlarme.find(alarm => alarm.type === "Delai d'expiration du transit"); */
      const cableDeverouilleAlarm = newAlarme.find(alarm => alarm.type === "Cable de securite deverouilee");

      const matchingAlarms = newAlarme.filter(alarm => 
        alarm.type === "Delai d'expiration du transit" || 
        alarm.type === "Delai d'expiration de la confirmation du retrait de l'unite"
      );

      if (matchingAlarms.length > 0) {
        const observationData = matchingAlarms.map(alarm => ({
          niveau: alarm.niveau,
          observation: alarm.observation
        }));
      
        const depassement_delai = await DepassementDelai.create({
          cargo: cargo.id,
          observation: observationData
        });
      
        console.log("DepassementDelai created:", depassement_delai);
      }

      if(cableDeverouilleAlarm){
        await CableDeverouille.create({
          cargo: cargo.id,
          //dateCoupure: req.body.dateCoupure,
          //heureCoupure: req.body.heureCoupure
          dateCoupure: cableDeverouilleAlarm.date,
          heureCoupure: cableDeverouilleAlarm.heure
        })
      }
      

        return res.status(StatusCodes.OK).json('Alarme added successfully!')
    }else{
      return res.status(StatusCodes.NOT_FOUND).json('Cargo not found')
    }
  } catch (error) {
    console.log(error)
  }
}
const addCreationFin = async(req, res)=>{
  try {
    const id = req.params.id
    //const cargo = await Cargo.findOne({where: {addedBy: req.user.id, id: id}})
    const cargo = await Cargo.findOne({where: {id: id}})

    if(cargo){
     /* await Cargo.update({creationDateFin: req.body.creationDateFin,
        creationHeureFin: req.body.creationHeureFin }, {where:{id:id, addedBy: req.user.id}})*/


        await Cargo.update({creationDateFin: req.body.creationDateFin,
          creationHeureFin: req.body.creationHeureFin }, {where:{id:id}})

        return res.status(StatusCodes.OK).json('La creation a ete enregistre avec succes!')
    }else{
      return res.status(StatusCodes.NOT_FOUND).json('Cargo not found')
    }

  } catch (error) {
    console.log(error)
  }
}

const addCloture = async(req, res) =>{
  try {
    const id = req.params.id
    //const cargo = await Cargo.findOne({where: {addedBy: req.user.id, id: id}})
    const cargo = await Cargo.findOne({where: {id: id}})

    if(cargo){
      const creationDate = new Date(cargo.creationDate);
      const clotureDate = new Date(req.body.clotureDate);
      
      const duree = clotureDate - creationDate;
      
      let dureeInDays = Math.ceil(duree / (1000 * 60 * 60 * 24)); 
      
      if (dureeInDays === 0) {
          dureeInDays = 1;
      }
       
        
       /* await Cargo.update({clotureDate: req.body.clotureDate,
          clotureHeure: req.body.clotureHeure,
          clotureLieu: req.body.clotureLieu,
          clotureMode: req.body.clotureMode, duree: dureeInDays}, {where:{id:id, addedBy: req.user.id}})*/

          await Cargo.update({clotureDate: req.body.clotureDate,
            clotureHeure: req.body.clotureHeure,
            clotureLieu: req.body.clotureLieu,
            clotureMode: req.body.clotureMode, duree: dureeInDays}, {where:{id:id}})

        return res.status(StatusCodes.OK).json('Alarme added successfully!')
    }else{
      return res.status(StatusCodes.NOT_FOUND).json('Cargo not found')
    }
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
   // if(cas){
   //   return res.status(StatusCodes.BAD_REQUEST).json('Donnee deja enregistree')
   // }else{
      const casSupect = await CasSuspect.create({
        cargo: id,
        commentaire: req.body.commentaire
      })
  
      return res.status(StatusCodes.OK).json({casSupect})
   // }
    
  } catch (error) {
    console.log(error)
    return res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

module.exports = {cargoRegistration, getMyCargoData, getMySingleCargoData, depassementDelaiRegistration, cableDeverouilleRegistration, casSupectRegistration, addAlarme, addCloture, addCreationFin, updateCargoData, deleteCargo}