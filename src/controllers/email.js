const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendInvestmentEmail = async (req, res) => {
  try {
    const { userEmail, userName, currentDate, investments, totalInvestment } =
      req.body;

    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, error: "userEmail is required" });
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto;">
        <div style="padding: 20px 0;">
          <p>Dear ${userName},</p>
          <p>We hope this email finds you well. As part of our commitment to keeping you informed about your investments with PMatts Innovative Catalysts Federation, we are pleased to provide you with a comprehensive summary of your investment portfolio as of ${currentDate}.</p>
          <div style="margin: 30px 0;">
            <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 20px;">Investment Portfolio Summary</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Date</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Project</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">Units</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${investments
                  .map(
                    (inv) => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">${new Date(
                      inv.investment_date
                    ).toLocaleDateString()}</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">${
                      inv.project_name
                    }</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${formatCurrency(
                      inv.amount
                    )}</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${
                      inv.units || "-"
                    }</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #e2e8f0;">${
                      inv.investment_status
                    }</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0;">Total Investment</td>
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border: 1px solid #e2e8f0;">${formatCurrency(
                    totalInvestment
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p>We greatly value your trust and continued support in our mission to drive positive societal transformation through innovative technologies and community initiatives.

If you have any questions about your investments or would like to explore new investment opportunities, please don't hesitate to reach out to our team.</p>
          <div style="margin-top: 30px;">
            <p>Best regards,</p>
            <p style="margin-top: 5px;">The PMatts Team</p>
          </div>
        </div>
      </div>`;

    // Initialize Brevo API Client
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
    sendSmtpEmail.subject = "Your Investment Portfolio Summary";
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

module.exports = sendInvestmentEmail;
