import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

export const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const TEST_ACCOUNTS = ["919999999999", "919999999998"];

const serviceClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      persistSession: false,
    },
  }
);

const validatePhone = (phone_number: string) => {
  const phoneRegex = /^91[6-9]\d{9}$/g;

  if (!phoneRegex.test(phone_number)) {
    throw new Error("Invalid phone number format");
  }
};

const sendCodeSms = async (phone: string, otp: string) => {
  try {
    const messageText = `Dear Customer, Your one-time password for verification is ${otp}. Thanks and Regards -PMATTS INNOVATIVE`;
    const encodedMessage = encodeURIComponent(messageText);

    const smsUrl = `http://cloud.smsindiahub.in/api/mt/SendSMS?APIKey=${Deno.env.get(
      "SMS_API_KEY"
    )}&senderid=PMATTS&channel=Trans&DCS=0&flashsms=0&number=91${phone}&text=${encodedMessage}&route=4&PEId=1101254130000084996&TemplateId=1101254130000084996`;

    const response = await fetch(smsUrl, { method: "GET" });
    const result = await response.text(); // or response.json() if API returns JSON

    if (!response.ok) {
      throw new Error(`Failed to send OTP: ${result}`);
    }

    console.log("OTP sent successfully:", result);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Could not send OTP");
  }
};

const login = async ({ phone_number }: { phone_number: string }) => {
  validatePhone(phone_number);

  const { data: existingUser, error: existingUserError } =
    await serviceClient.rpc("get_user_by_phone", { phone_number });

  if (existingUserError) {
    throw existingUserError;
  }

  if (!existingUser || existingUser.length === 0) {
    throw new Error("User does not exist");
  }

  let code = "";

  if (TEST_ACCOUNTS.includes(phone_number)) {
    code = Deno.env.get("TEST_ACCOUNT_CODE") as string;
  } else {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    await sendCodeSms(phone_number.slice(2), code);
  }

  const { error: otpError } = await serviceClient.rpc("set_confirmation", {
    phone_number,
    code,
  });

  if (otpError) {
    throw otpError;
  }
};

const resend = async ({ phone_number }: { phone_number: string }) => {
  validatePhone(phone_number);

  const { data: existingUser, error: existingUserError } =
    await serviceClient.rpc("get_user_by_phone", { phone_number });

  if (existingUserError) {
    throw existingUserError;
  }

  if (!existingUser || existingUser.length === 0) {
    throw new Error("User does not exist");
  }

  let code = "";

  if (TEST_ACCOUNTS.includes(phone_number)) {
    code = Deno.env.get("TEST_ACCOUNT_CODE") as string;
  } else {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    await sendCodeSms(phone_number.slice(2), code);
  }

  const { error: otpError } = await serviceClient.rpc("set_confirmation", {
    phone_number,
    code,
  });

  if (otpError) {
    throw otpError;
  }
};

const verifyOtp = async ({ phone_number, code }: { phone_number: string; code: string }) => {
  validatePhone(phone_number);

  const { data: isValid, error } = await serviceClient.rpc("verify_otp", {
    phone_number,
    code,
  });

  if (error) {
    throw error;
  }

  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  return "OTP verified successfully!";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const {
      operation,
      payload,
    }: { operation: string; payload: { phone_number: string; code?: string } } = await req.json();

    if (operation === "login") {
      await login(payload);
    } else if (operation === "resend") {
      await resend(payload);
    } else if (operation === "verify") {
      const message = await verifyOtp(payload);
      return new Response(JSON.stringify({ error: false, message }), {
        status: 200,
        headers,
      });
    } else {
      throw new Error("Invalid operation");
    }

    return new Response(JSON.stringify({ error: false, message: "Success" }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message,
      }),
      {
        status: 500,
        headers,
      }
    );
  }
});
