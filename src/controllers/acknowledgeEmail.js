const SibApiV3Sdk = require("sib-api-v3-sdk");

const acknowledgeEmail = async (req, res) => {
  try {
    const { userName, userEmail, projectName, investedAmount } = req.body;

    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, error: "userEmail is required" });
    }

    const emailHtml = `
   <p>Dear ${userName},</p>

  <p>I hope this email finds you well.</p>

  <p>We are pleased to acknowledge the receipt of your investment of <strong>₹ ${investedAmount}</strong> in <strong>${projectName}</strong>. We sincerely appreciate your trust and confidence in our vision and commitment to growth.</p>

  <p>Thank you for your support and belief in Pmatts. We look forward to a successful partnership.</p>

  <p>Best regards,<br>
  The Pmatts Team</p>
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
    sendSmtpEmail.subject = "Achnowledgement Receipt";
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

module.exports = acknowledgeEmail;
