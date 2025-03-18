const Payu = require('payu-websdk');

const payu_key = process.env.PAYU_MERCHANT_KEY
const payu_salt = process.env.PAYU_MERCHANT_SALT

// console.log("PayU Base URL:", process.env.PAYU_BASE_URL);
// console.log("PayU Environment:", process.env.PAYU_ENVIRONMENT);


const payuCLient = new Payu({
    key: payu_key,
    salt: payu_salt,
},process.env.PAYU_ENVIRONMENT);

exports.PayData = {
    payuCLient,
    payu_key,
    payu_salt
}