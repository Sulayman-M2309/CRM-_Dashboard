import nodemailer from 'nodemailer';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailtemplates.js";

// Replace this with your Mailtrap SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',  // SMTP host
  port: 587,  // SMTP port
  auth: {
    user: 'a9b26e1b1928d5', // Replace with your Mailtrap username
    pass: '93e5678dbb4941', // Replace with your Mailtrap password
  },
});

const sender = 'solaymanh33@gmail.com'; // Your email (Mailtrap's sender email)

export const SendVerificationEmail = async (email, verificationcode) => {
  const mailOptions = {
    from: sender,
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationcode),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: ', info.response);
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const SendWelcomeEmail = async (email, firstname, lastname, role) => {
  const mailOptions = {
    from: sender,
    to: email,
    subject: 'Welcome to Our Service',
    html: role === "HR-Admin"
      ? `<p>Welcome, ${firstname} ${lastname} - HR</p><p>Company: Your Company Name - [EMS]</p>`
      : `<p>Welcome, ${firstname} ${lastname}</p><p>Company: Company Name - (EMS)</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ', info.response);
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const SendForgotPasswordEmail = async (email, resetURL) => {
  const mailOptions = {
    from: sender,
    to: email,
    subject: "Reset Your Password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent: ', info.response);
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const SendResetPasswordConfimation = async (email) => {
  const mailOptions = {
    from: sender,
    to: email,
    subject: "Password Reset Successfully",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reset password confirmation email sent: ', info.response);
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};
