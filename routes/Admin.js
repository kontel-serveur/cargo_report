const express = require('express')
const router = express.Router()

const {getCargoData, getSingleCargoData, getUser, getSingleUser, registerUser, updateUser, updateUserPassword, cargoUpdate, profileUpdate, passwordChange} = require('../controllers/Admin')

router.get('/cargo', getCargoData)
router.get('/cargo/:id', getSingleCargoData)
router.patch('/cargo-update/:id', cargoUpdate)
router.get('/users', getUser)
router.get('/users/:id', getSingleUser)
router.patch('/users/profile/:id', updateUser)
router.patch('/users/password/:id', updateUserPassword)
router.post('/users/registration', registerUser)
router.patch('/profile-update', profileUpdate)
router.patch('/password-change', passwordChange)


module.exports = router