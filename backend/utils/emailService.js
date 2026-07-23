// ======================================
// Imports
// ======================================

const nodemailer = require("nodemailer");

// ======================================
// Email Transporter
// ======================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================
// Verify SMTP Connection
// ======================================

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Gmail SMTP Error:");
    console.log(error.message);
  } else {
    console.log("✅ Gmail SMTP Connected Successfully");
  }
});

// ======================================
// Send OTP Email
// ======================================

const sendOTPEmail = async (
  email,
  otp,
  name = "Member"
) => {
  try {
    const mailOptions = {
      from: `"Skylark Cooperative Society" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Password Reset OTP | Skylark Cooperative Society",

      html: `
      <!DOCTYPE html>
      <html>

      <head>
        <meta charset="UTF-8">
      </head>

      <body style="
        margin:0;
        padding:30px;
        background:#f5f5f5;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <table
          width="600"
          align="center"
          cellpadding="0"
          cellspacing="0"
          style="
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 5px 15px rgba(0,0,0,.15);
          "
        >

          <tr>
            <td
              style="
                background:#2563eb;
                color:#fff;
                padding:25px;
                text-align:center;
                font-size:26px;
                font-weight:bold;
              "
            >
              Skylark Cooperative Society
            </td>
          </tr>

          <tr>
            <td style="padding:35px;">

              <h2>Hello ${name},</h2>

              <p>
                We received a request to reset your password.
              </p>

              <p>
                Use the following OTP:
              </p>

              <div
                style="
                  text-align:center;
                  font-size:38px;
                  font-weight:bold;
                  color:#16a34a;
                  letter-spacing:10px;
                  margin:35px 0;
                "
              >
                ${otp}
              </div>

              <p>
                This OTP is valid for
                <b>5 minutes</b>.
              </p>

              <p>
                If you didn't request this password reset,
                simply ignore this email.
              </p>

            </td>
          </tr>

          <tr>
            <td
              style="
                background:#f3f4f6;
                padding:20px;
                text-align:center;
                color:#666;
                font-size:13px;
              "
            >
              © 2026 Skylark Cooperative Management System
            </td>
          </tr>

        </table>

      </body>

      </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("====================================");
    console.log("✅ OTP Email Sent Successfully");
    console.log("To :", email);
    console.log("Message ID :", info.messageId);
    console.log("====================================");

    return true;

  } catch (error) {

    console.log("====================================");
    console.log("❌ Email Sending Failed");
    console.log(error);
    console.log("====================================");

    return false;
  }
};

// ======================================
// Export
// ======================================

module.exports = {
  sendOTPEmail,
};