const express = require("express");
const { initiatePayment } = require("../controllers/initiatePayment.js");
const { verifyPayment } = require('../controllers/verifyPayment.js');

const router = express.Router();

router.post("/payu-payment", initiatePayment);
router.post("/verify/:txnid", verifyPayment);

module.exports = router;
