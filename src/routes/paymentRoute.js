const express = require("express");
const { initiatePayment } = require("../controllers/initiatePayment.js");
const { verifyPayment } = require('../controllers/verifyPayment.js');
const { payuWebhook } = require("../controllers/webhook.js");


const router = express.Router();

router.post("/payu-payment", initiatePayment);
router.post("/verify/:txnid", verifyPayment);
router.post('/payu-webhook', payuWebhook)


module.exports = router;
