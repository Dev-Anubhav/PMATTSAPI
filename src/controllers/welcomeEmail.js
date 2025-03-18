const SibApiV3Sdk = require("sib-api-v3-sdk");

const welcomeEmail = async (req, res) => {
  try {
    const { userName, userEmail } = req.body;

    console.log(userEmail, userName)

    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, error: "userEmail is required" });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="background-color: #F4F6F9; padding: 20px;">
          <h2 style="text-align: center; color: #4CAF50;">Welcome to Pmatts, ${userName}!</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
          <p style="font-size: 16px;">Hi ${userName},</p>
          <p style="font-size: 16px;">Thank you for joining <strong>Pmatts</strong>!</p>
          <p style="font-size: 16px;">We’re excited to have you as part of our community. We look forward to a successful partnership ahead.</p>
          <p style="font-size: 16px;">If you have any questions, feel free to reach out. We’re here to help!</p>
          <br />
          <p style="font-size: 16px;">Best regards,</p>
          <p style="font-size: 16px;">The Pmatts Team</p>
        </div>
        <div style="background-color: #F4F6F9; padding: 10px; text-align: center;">
          <p style="font-size: 14px; color: #888;">&copy; ${new Date().getFullYear()} Pmatts. All Rights Reserved.</p>
        </div>
      </div>
    `;

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
    sendSmtpEmail.subject = "Welcome to Pmatts!";
    sendSmtpEmail.htmlContent = emailHtml;

    apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then(function (data) {
        console.log("Email sent successfully:", data);
        res.json({ success: true, data });
      })
      .catch(function (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, error: error.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = welcomeEmail;
