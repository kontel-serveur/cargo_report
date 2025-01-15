const express = require('express')
const router = express.Router()

const {cargoRegistration, getMyCargoData, getMySingleCargoData, depassementDelaiRegistration, cableDeverouilleRegistration} = require('../controllers/Cargo')

router.post('/ajout', cargoRegistration)
router.get('/donnee', getMyCargoData)
router.get('/donnee/:id', getMySingleCargoData)
router.post('/depassement-delai/:id', depassementDelaiRegistration)
router.post('/cable-deverouille/:id', cableDeverouilleRegistration)
//router.post('/login', userLogin)

module.exports = router