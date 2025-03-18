const express = require('express');
const  investmentEmail  = require('../controllers/email');
const acknowledgeEmail = require('../controllers/acknowledgeEmail');
const welcomeEmail = require('../controllers/welcomeEmail');
const kycEmail = require('../controllers/kycEmail');

const router = express.Router();

router.post('/send-investment-email', investmentEmail)
router.post('/send-acknowledge-email', acknowledgeEmail)
router.post('/welcome-email', welcomeEmail)
router.post('/kyc-email', kycEmail)

module.exports = router