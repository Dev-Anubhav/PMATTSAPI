import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { generateOtp, sendSms } from "../helpers.ts"; 

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    // Parse request body
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone is required" }), { status: 400 });
    }

    // Generate OTP
    const otp = generateOtp(); // Ensure this returns a valid 6-digit OTP

    // Send OTP via SMS
    const smsResponse = await sendSms(phone, otp);
    if (!smsResponse.success) {
      return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
    }

    // Save OTP to Supabase
    const { error } = await supabase.from("otp_codes").insert([{ phone, otp }]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "OTP Sent" }), { status: 200 });
  } catch (err) {
    console.error("Server Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});
