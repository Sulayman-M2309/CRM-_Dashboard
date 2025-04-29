import nodemailer from "nodemailer";
async function sendEmail(email,otp){

    const transporter = nodemailer.createTransport({
     service:"gmail",
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASSWORD,
        },
      });
//  send mail with defined transport object
 const info = await transporter.sendMail({
    from: process.env.AUTH_EMAIL, // sender address
    to: email, // list of receivers
    subject: "otp verification", // Subject line
    text: "Please verify your account", // plain text body
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
        .logo {
            width: 100px;
            margin-bottom: 20px;
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
            color:rgb(83, 207, 58);
            background: #fef3e6;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn {
            display: inline-block;
            background:rgb(45, 207, 140);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
            font-weight: bold;
        }
        .btn:hover {
            background:rgba(228, 28, 28, 0.97);
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
        <img src="../logo/logo.webp"  class="logo">
        <div class="header">Your OTP Code</div>
        <p class="message">Use the OTP below to verify your email. This OTP is valid for 10 minutes.</p>
        <div class="otp">${otp}</div>
        <p class="message">If you didn’t request this, please ignore this email.</p>
        <a href="{{VERIFY_LINK}}" class="btn">Verify Now</a>
        <div class="footer">© 2025 Md Sulayman Hosen Abir. All rights reserved.</div>
    </div>
</body>
</html>

    `, // html body
  });
}
export default sendEmail;