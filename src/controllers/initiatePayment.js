const crypto = require("crypto");
const { PayData } = require("../../payu.config.js");

exports.initiatePayment = async (req, res) => {
    const port = process.env.PORT
    const baseUrl = process.env.BASE_URL
    const { amount, product, firstname, email, phone, txnid } = req.body;

    if (!amount || !product || !firstname || !email || !phone || !txnid) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    
    const hashString = `${PayData.payu_key}|${txnid}|${amount}|${product}|${firstname}|${email}|||||||||||${PayData.payu_salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    try {
        const data = await PayData.payuCLient.paymentInitiate({
            isAmountFilledByCustomer: false,
            txnid,
            amount,
            productinfo: product,
            firstname,
            email,
            phone,
            surl: `${baseUrl}${port}/payment/verify/${txnid}`,
            furl: `${baseUrl}${port}/payment/verify/${txnid}`,
            hash
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: "Payment initiation failed", error: error.message });
    }
};
