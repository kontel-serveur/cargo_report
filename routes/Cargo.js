const express = require('express')
const router = express.Router()

const {cargoRegistration, getMyCargoData, getMySingleCargoData, depassementDelaiRegistration, cableDeverouilleRegistration, casSupectRegistration, addAlarme, addCloture, addCreationFin, updateCargoData, deleteCargo} = require('../controllers/Cargo')

router.post('/ajout', cargoRegistration)
router.get('/donnee', getMyCargoData)
router.get('/donnee/:id', getMySingleCargoData)
router.post('/depassement-delai/:id', depassementDelaiRegistration)
router.post('/cable-deverouille/:id', cableDeverouilleRegistration)
router.post('/cas-suspect/:id', casSupectRegistration)

router.patch('/alarme/:id', addAlarme)
router.patch('/cloture/:id', addCloture)
router.patch('/creation-fin/:id', addCreationFin)
router.patch('/donnee/:id/update', updateCargoData)
router.delete('/donnee/:id/delete', deleteCargo)
//router.post('/login', userLogin)

module.exports = router