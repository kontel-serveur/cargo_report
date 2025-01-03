const express = require('express')
const router = express.Router()

const {tokenVerification
    
} = require('../controllers/TokenVerification')

router.route('/').post(tokenVerification)

module.exports = router;