const express = require('express')
const router = express.Router()

const {getProfile, profileUpdate, passwordChange} = require('../controllers/User')

router.get('/details', getProfile)
router.patch('/update', profileUpdate)
router.patch('/password-change', passwordChange)

module.exports = router