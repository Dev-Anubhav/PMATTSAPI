const axios = require("axios");
require("dotenv").config(); // Load environment variables
 
// Function to generate a 6-digit OTP
function generateOtp(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}
 
// Function to send an SMS via a custom SMS provider
async function sendSms(phone, otp) {
  const SMS_API_URL = process.env.SMS_API_URL; // Your SMS provider's API endpoint
  const SMS_API_KEY = process.env.SMS_API_KEY; // API Key or Auth Token
  const SENDER_ID = process.env.SMS_SENDER_ID || "OTPService"; // Optional sender ID
  const MESSAGE = `Your OTP code is: ${otp}`; // SMS Message format
 
  try {
    const response = await axios.post(SMS_API_URL, {
      phone, 
      message: MESSAGE,
      sender_id: SENDER_ID,
      api_key: SMS_API_KEY,
    });
 
    if (response.data.success) {
      console.log("SMS Sent Successfully:", response.data);
      return response.data;
    } else {
      console.error("SMS Sending Failed:", response.data);
      throw new Error("Failed to send SMS");
    }
  } catch (error) {
    console.error("Error in sending SMS:", error.message);
    throw new Error("SMS API request failed");
  }
}
 
module.exports = { generateOtp, sendSms };