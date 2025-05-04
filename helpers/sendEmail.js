import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, otp }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to,
    subject,
    text: `Your OTP code is: ${otp}`, // plain text message with OTP
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>OTP Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
                  margin: 0;
              }
              .container {
                  max-width: 500px;
                  background: #ffffff;
                  padding: 20px;
                  margin: auto;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
              }
              .header {
                  font-size: 22px;
                  font-weight: bold;
                  color: #333;
                  margin-bottom: 10px;
              }
              .message {
                  font-size: 16px;
                  color: #555;
                  margin-bottom: 20px;
              }
              .otp {
                  font-size: 24px;
                  font-weight: bold;
                  color: #4CAF50;
                  background: #fef3e6;
                  display: inline-block;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin: 10px 0;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">Email Verification Code</div>
              <p class="message">Use the OTP below to verify your email. This OTP is valid for 5 minutes.</p>
              <div class="otp">${otp}</div>
              <p class="message">If you didn’t request this, please ignore this email.</p>
              <div class="footer">© 2025 Md Sulayman Hosen Abir. All rights reserved.</div>
          </div>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
