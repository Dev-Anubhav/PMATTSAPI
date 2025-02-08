const Payu = require('payu-websdk');

const payu_key = process.env.PAYU_MERCHANT_KEY
const payu_salt = process.env.PAYU_MERCHANT_SALT


const payuCLient = new Payu({
    key: payu_key,
    salt: payu_salt,
},process.env.PAYU_ENVIRONMENT);

exports.PayData = {
    payuCLient,
    payu_key,
    payu_salt
}