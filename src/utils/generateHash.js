const crypto = require("crypto");
const { PayData } = require("../config/payu.config");

exports.generateHash = (txnid, amount, product, firstname, email) => {
    const hashString = `${PayData.payu_key}|${txnid}|${amount}|${product}|${firstname}|${email}|||||||||||${PayData.payu_salt}`;
    return crypto.createHash("sha512").update(hashString).digest("hex");
};
