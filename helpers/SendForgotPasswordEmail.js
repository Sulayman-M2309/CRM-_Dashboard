import nodemailer from 'nodemailer';

const SendForgotPasswordEmail = async (email, URL) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Reset Your Password',
    text: `Click on the following link to reset your password: ${URL}`,
    html: `
      <html>
        <body>
          <p>Click on the following link to reset your password:</p>
          <a href="${URL}">${URL}</a>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error('Error sending reset password email');
  }
};

export default SendForgotPasswordEmail;
