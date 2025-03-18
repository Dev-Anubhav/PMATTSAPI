



export const sendCodeSms = async (phone, otp) => {
    console.log("Phone",phone)
    try {
      const messageText = `Dear Customer, Your one-time password for verification is ${otp}. Thanks and Regards -PMATTS INNOVATIVE`;
      const encodedMessage = encodeURIComponent(messageText);
  
      const smsUrl = `http://cloud.smsindiahub.in/api/mt/SendSMS?APIKey=${process.env.SMS_API_KEY}&senderid=PMATTS&channel=Trans&DCS=0&flashsms=0&number=91${phone}&text=${encodedMessage}&route=4&PEId=1101254130000084996&TemplateId=1101254130000084996`;
  
      const response = await fetch(smsUrl);
      const res = await response.json();
    
  
      if (response.status !== 200) {
        throw new Error(`Failed to send OTP: ${res.data}`);
      }

      console.log("OTP sent successfully:", res);
    } catch (error) {
      console.error("Error sending SMS:", error.response?.data || error.message);
      throw new Error("Could not send OTP");
    }
  };
