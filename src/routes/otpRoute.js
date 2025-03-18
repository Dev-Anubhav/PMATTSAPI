const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/mobileOtp');
const { login, resendOtp, verifiedOtp } = require('../controllers/otpAuth');


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post("/login", login);
router.post("/resend", resendOtp);
router.post("/verify",verifiedOtp );


module.exports = router;
