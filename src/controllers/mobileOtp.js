const axios = require('axios');
const otpGenerator = require('otp-generator');
const {supabase,supabaseAdmin} = require('../Supabase/supabase');
const jwt = require('jsonwebtoken')



const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

     
        const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) {
            console.error('Error fetching user:', userError);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const user = existingUser?.users?.find(u => u.phone === phone);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not registered with us' });
        }

     
        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        //  Store OTP in Supabase
        const { error: otpError } = await supabaseAdmin
            .from('otps')
            .upsert([{ phone, otp, created_at: new Date() }], { onConflict: ['phone'] });

        if (otpError) {
            console.error('Failed to store OTP:', otpError);
            return res.status(500).json({ success: false, message: 'Failed to store OTP' });
        }

        //  Send OTP via SMS India Hub
        const messageText = `Dear Customer, Your one-time password for verification is ##Field##. Thanks and Regards -PMATTS INNOVATIVE`;
        const encodedMessage = encodeURIComponent(messageText.replace('##Field##', otp));
        

        const smsUrl = `http://cloud.smsindiahub.in/api/mt/SendSMS?APIKey=${process.env.SMS_API_KEY}&senderid=PMATTS&channel=Trans&DCS=0&flashsms=0&number=91${phone}&text=${encodeURIComponent(`Dear Customer, Your one-time password for verification is ${otp}. Thanks and Regards -PMATTS INNOVATIVE`)}&route=4&PEId=1101254130000084996&TemplateId=1101254130000084996`;

        // console.log('SMS URL:', smsUrl);

        //  Sending SMS
        const response = await fetch(smsUrl);
        const result = await response.json();
        // console.log('SMS Response:', result);

        if (result.ErrorCode !== "000") {
            console.error('SMS Sending Failed:', result);
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }

        return res.status(200).json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Unexpected Error:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};




const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone & OTP required" });
        }

        // ✅ Fetch stored OTP from Supabase
        const { data: storedOtp, error: otpError } = await supabaseAdmin
            .from("otps")
            .select("otp")
            .eq("phone", phone)
            .single();

        if (otpError || !storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // ✅ Check if the user exists in Supabase Auth
        const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) {
            return res.status(500).json({ success: false, message: "Error fetching users" });
        }

        let user = existingUser?.users?.find(u => u.phone === phone);

        // ✅ If user does not exist, create a new user using email from DB
        if (!user) {
            // Fetch email associated with the phone number from your DB
            const { data: userRecord, error: emailError } = await supabaseAdmin
                .from("users") // Make sure this is your user table name
                .select("email")
                .eq("phone", phone)
                .single();

            if (emailError || !userRecord) {
                return res.status(404).json({ success: false, message: "No email found for this phone number" });
            }

            const userEmail = userRecord.email;
            const randomPassword = Math.random().toString(36).slice(-8); // Generate random password

            // Sign up the user in Supabase Auth
            const { data: newUser, error: signupError } = await supabaseAdmin.auth.admin.createUser({
                email: userEmail,
                password: randomPassword,
                phone: phone,
                email_confirm: true, // Automatically confirm email
            });

            if (signupError) {
                return res.status(500).json({ success: false, message: "Error signing up user" });
            }

            user = newUser; // Set the new user
        }

        // ✅ Generate JWT token
        // const tokenPayload = {
        //     sub: user.id,
        //     phone: user.phone,
        //     role: "authenticated",
        // };

        // const accessToken = jwt.sign(tokenPayload, process.env.SUPABASE_JWT_SECRET, { expiresIn: "1h" });
        // const refreshToken = jwt.sign(tokenPayload, process.env.SUPABASE_JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).json({
            success: true,
            // access_token: accessToken,
            // refresh_token: refreshToken,
            email: user.email 
        });

    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
    }
};







module.exports = { sendOtp, verifyOtp };
