const SibApiV3Sdk = require("sib-api-v3-sdk");

const kycEmail = async (req, res) => {
  try {
    const { userName, userEmail, kycStatus, rejectNote } = req.body;

    if (!userEmail || !kycStatus) {
      return res.status(400).json({ success: false, error: "userEmail and kycStatus are required" });
    }

    let emailHtml;
    let subject;

    if (kycStatus === "approved") {
      subject = "Your KYC has been Approved!";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background-color: #F4F6F9; padding: 20px;">
            <h2 style="text-align: center; color: #4CAF50;">KYC Approved!</h2>
          </div>
          <div style="padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">Great news! Your KYC verification has been approved.</p>
            <p style="font-size: 16px;">You can now enjoy full access to our platform.</p>
            <br />
            <p style="font-size: 16px;">Best regards,</p>
            <p style="font-size: 16px;">The Pmatts Team</p>
          </div>
          <div style="background-color: #F4F6F9; padding: 10px; text-align: center;">
            <p style="font-size: 14px; color: #888;">&copy; ${new Date().getFullYear()} Pmatts. All Rights Reserved.</p>
          </div>
        </div>
      `;
    } else if (kycStatus === "rejected") {
      if (!rejectNote) {
        return res.status(400).json({ success: false, error: "rejectNote is required when KYC is rejected" });
      }
      subject = "Your KYC has been Rejected";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background-color: #F4F6F9; padding: 20px;">
            <h2 style="text-align: center; color: #E53935;">KYC Rejected</h2>
          </div>
          <div style="padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
            <p style="font-size: 16px;">Hi ${userName},</p>
            <p style="font-size: 16px;">Unfortunately, your KYC verification has been rejected.</p>
            <p style="font-size: 16px;">Reason: <strong>${rejectNote}</strong></p>
            <p style="font-size: 16px;">Please review the reason and submit your KYC again if applicable.</p>
            <br />
            <p style="font-size: 16px;">Best regards,</p>
            <p style="font-size: 16px;">The Pmatts Team</p>
          </div>
          <div style="background-color: #F4F6F9; padding: 10px; text-align: center;">
            <p style="font-size: 14px; color: #888;">&copy; ${new Date().getFullYear()} Pmatts. All Rights Reserved.</p>
          </div>
        </div>
      `;
    } else {
      return res.status(400).json({ success: false, error: "Invalid kycStatus. Must be 'approved' or 'rejected'." });
    }

    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: "PMatts Team",
      email: "anubhavtrivedi222@gmail.com",
    };
    sendSmtpEmail.to = [{ email: userEmail }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = emailHtml;

    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then(data => {
        console.log("Email sent successfully:", data);
        res.json({ success: true, data });
      })
      .catch(error => {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, error: error.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = kycEmail;
