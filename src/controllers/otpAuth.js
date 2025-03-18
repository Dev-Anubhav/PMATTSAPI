
import { supabaseAdmin } from "../Supabase/supabase.js";
import { sendCodeSms } from "../utils/sendSms.js";

const TEST_ACCOUNTS = ["919999999999", "919999999998"];

const validatePhone = (phone_number) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone_number)) {
    throw new Error("Invalid phone number format");
  }
};

export const login = async (req, res) => {
  try {
    const { phone_number } = req.body;
    validatePhone(phone_number);

    const { data: existingUser, error } = await supabaseAdmin.rpc("get_user_by_phone", { phone_number });

    if (error) throw error;
    if (!existingUser || existingUser.length === 0) throw new Error("User does not exist");

    let code = TEST_ACCOUNTS.includes(phone_number)
      ? process.env.TEST_ACCOUNT_CODE
      : Math.floor(1000 + Math.random() * 9000).toString();

    await sendCodeSms(phone_number, code);

    await supabaseAdmin.rpc("set_confirmation", { phone_number, code });

    res.json({ error: false, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    validatePhone(phone_number);

    const { data: existingUser, error } = await supabaseAdmin.rpc("get_user_by_phone", { phone_number });

    if (error) throw error;
    if (!existingUser || existingUser.length === 0) throw new Error("User does not exist");

    let code = TEST_ACCOUNTS.includes(phone_number)
      ? process.env.TEST_ACCOUNT_CODE
      : Math.floor(1000 + Math.random() * 9000).toString();

    await sendCodeSms(phone_number.slice(2), code);

    await supabase.rpc("set_confirmation", { phone_number, code });

    res.json({ error: false, message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const verifiedOtp = async (req, res) => {
    try {
      const { phone_number, code } = req.body;
      validatePhone(phone_number);
  
      // Call Supabase RPC function to verify OTP
      const { data: user, error } = await supabaseAdmin.rpc("verify_otp", { phone_number, code });
  
      if (error) throw error;
      if (!user || user.length === 0) throw new Error("Invalid OTP");
  
      // Generate a session token
      const { data: session, error: sessionError } = 
        await supabaseAdmin.auth.admin.createSession(user[0].id);
  
      if (sessionError) throw sessionError;
  
      // Return session with success response
      res.json({ error: false, message: "OTP verified successfully!", session });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  };
  
  
