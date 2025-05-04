import { HumanResources } from "../models/HRModel.js";
import { Organization } from "../models/OrganizationModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { GenerateJwtTokenAndSetCookiesHR } from "../utils/generatejwttokenandsetcookies.js";
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js";
import sendEmail from "../helpers/sendEmail.js";
import  SendForgotPasswordEmail  from "../helpers/sendforgotpasswordemail.js";
export const HandleHRSignup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      contactnumber,
      name,
      description,
      OrganizationURL,
      OrganizationMail,
    } = req.body;

    // Check for missing required fields
    if (
      !name ||
      !description ||
      !OrganizationURL ||
      !OrganizationMail ||
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !contactnumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        type: "signup",
      });
    }

    // Check if HR already exists
    const existingHR = await HumanResources.findOne({ email });
    if (existingHR) {
      return res.status(400).json({
        success: false,
        message:
          "HR already exists, please go to the login page or create new HR",
        type: "signup",
      });
    }

    // Check for existing organization or create new one
    let organization = await Organization.findOne({
      name,
      OrganizationURL,
      OrganizationMail,
    });

    if (!organization) {
      organization = await Organization.create({
        name,
        description,
        OrganizationURL,
        OrganizationMail,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP for email verification
    const verificationCode = GenerateVerificationToken(6);

    // Create new HR
    const newHR = await HumanResources.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      contactnumber,
      role: "HR-Admin",
      organizationID: organization._id,
      verificationtoken: verificationCode,
      verificationtokenexpires: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
    });

    // Add new HR to the organization
    organization.HRs.push(newHR._id);
    await organization.save();

    // Generate JWT and set cookies
    GenerateJwtTokenAndSetCookiesHR(res, newHR._id, newHR.role, organization._id);

    // Send verification email
    const emailStatus = await sendEmail({
      to: email,
      subject: "HR Email Verification",
      otp: verificationCode,  // Make sure to pass the OTP here
    });

    return res.status(201).json({
      success: true,
      message: organization.isNew
        ? "Organization Created & HR Registered Successfully"
        : "HR Registered Successfully",
      VerificationEmailStatus: emailStatus,
      type: "signup",
      HRid: newHR._id,
    });
  } catch (error) {
    // Improved error handling
    return res.status(500).json({
      success: false,
      message: `Error during HR signup: ${error.message}`,
      type: "signup",
    });
  }
};


export const HandleHRVerifyEmail = async (req, res) => {
  const { verificationcode } = req.body;
  try {
    const HR = await HumanResources.findOne({
      verificationtoken: verificationcode,
      organizationID: req.ORGID,
      verificationtokenexpires: { $gt: Date.now() },
    });

    if (!HR) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Verification Code",
        type: "HRverifyemail",
      });
    }

    HR.isverified = true;
    HR.verificationtoken = undefined;
    HR.verificationtokenexpires = undefined;
    await HR.save();

    // Send Welcome Email after verification
    const sendEmailStatus = await sendEmail({
      to: HR.email,
      subject: "Welcome to the Organization",
      text: `Hello ${HR.firstname},\n\nYour email has been successfully verified. Welcome to the organization!`,
    });

    return res.status(200).json({
      success: true,
      message: "Email Verified successfully",
      sendEmailStatus: sendEmailStatus,
      type: "HRverifyemail",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      type: "HRverifyemail",
    });
  }
};

export const HandleHRLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const HR = await HumanResources.findOne({ email: email });

    if (!HR) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials, Please Add Correct One", // Corrected spelling
        type: "HRLogin",
      });
    }

    const isMatch = await bcrypt.compare(password, HR.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials, Please Add Correct One", // Corrected spelling
        type: "HRLogin",
      });
    }

    // Generate JWT token and set cookies
    const token = GenerateJwtTokenAndSetCookiesHR(res, HR._id, HR.role, HR.organizationID);
    
    HR.lastlogin = new Date();
    await HR.save();

    return res.status(200).json({
      success: true,
      message: "HR Login Successful",  // Corrected spelling
      type: "HRLogin",
      token,  // Include the token in the response if necessary for front-end
    });
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error", // General message
      type: "HRLogin",
    });
  }
};


export const HandleHRLogout = async (req, res) => {
  try {
    res.clearCookie("HRtoken");
    return res
      .status(200)
      .json({ success: true, message: "HR Logged Out Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error", error: error });
  }
};

export const HandleHRCheck = async (req, res) => {
  try {
    const HR = await HumanResources.findOne({
      _id: req.HRid,
      organizationID: req.ORGID,
    });
    if (!HR) {
      return res
        .status(404)
        .json({ success: false, message: "HR not found", type: "checkHR" });
    }
    return res.status(200).json({
      success: true,
      message: "HR Already Logged In",
      type: "checkHR",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error,
      message: "internal error",
      type: "checkHR",
    });
  }
};

export const HandleHRForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Ensure HR is found in the correct organization
    const HR = await HumanResources.findOne({
      email: email,
      organizationID: req.ORGID,
      _id: req.HRid,
    });

    if (!HR) {
      return res.status(404).json({
        success: false,
        message: "HR Email Does Not Exist, Please Enter Correct One",
        type: "HRforgotpassword",
      });
    }

    // Create a reset password token and set expiration time
    const resetToken = crypto.randomBytes(25).toString('hex');
    const resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    HR.resetpasswordtoken = resetToken;
    HR.resetpasswordexpires = resetTokenExpires;
    await HR.save();

    // Generate URL for the password reset page
    const URL = `${process.env.CLIENT_URL.replace(/\/$/, '')}/auth/HR/resetpassword/${resetToken}`;

    // Send the reset password email
    const SendResetPasswordEmailStatus = await SendForgotPasswordEmail(email, URL);

    return res.status(200).json({
      success: true,
      message: 'Reset Password Email Sent Successfully',
      SendResetPasswordEmailStatus: SendResetPasswordEmailStatus,
      type: 'HRforgotpassword',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
      type: 'HRforgotpassword',
    });
  }
};



export const HandleHRResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Clear the HRtoken cookie if it exists
    if (req.cookies.HRtoken) {
      res.clearCookie("HRtoken");
    }

    // Find the HR record by reset password token and check if it is still valid
    const HR = await HumanResources.findOne({
      resetpasswordtoken: token,
      resetpasswordexpires: { $gt: Date.now() },
    });

    if (!HR) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Reset Password Token",
        resetpassword: false,
      });
    }

    // Validate password strength (e.g., minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        resetpassword: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    HR.password = hashedPassword;
    HR.resetpasswordtoken = undefined; // Invalidate reset token
    HR.resetpasswordexpires = undefined; // Invalidate expiry
    await HR.save();

    // Send password reset confirmation email
    const SendPasswordResetEmailStatus = await SendResetPasswordConfimation(
      HR.email
    );

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
      SendPasswordResetEmailStatus: SendPasswordResetEmailStatus,
      resetpassword: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,  // Log only message for production
      resetpassword: false,
    });
  }
};


export const HandleHRResetverifyEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const HR = await HumanResources.findOne({
      email: email,
      _id: req.HRid,
      organizationID: req.ORGID,
    });

    if (!HR) {
      return res.status(404).json({
        success: false,
        message: "HR Email Does Not Exist, Please Enter Correct Email",
        type: "HRResendVerifyEmail",
      });
    }

    if (HR.isverified) {
      return res.status(400).json({
        success: false,
        message: "HR Email is already Verified",
        type: "HRResendVerifyEmail",
      });
    }

    const verificationcode = GenerateVerificationToken(6);
    HR.verificationtoken = verificationcode;
    HR.verificationtokenexpires = Date.now() + 5 * 60 * 1000;

    await HR.save();

    const SendVerificationEmailStatus = await SendVerificationEmail(
      email,
      verificationcode
    );
    return res.status(200).json({
      success: true,
      message: "Verification Email Sent Successfully",
      SendVerificationEmailStatus: SendVerificationEmailStatus,
      type: "HRResendVerifyEmail",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error });
  }
};

export const HandleHRcheckVerifyEmail = async (req, res) => {
  try {
    const HR = await HumanResources.findOne({
      _id: req.HRid,
      organizationID: req.ORGID,
    });

    if (HR.isverified) {
      return res.status(200).json({
        sucess: true,
        message: "HR Already Verified",
        type: "HRcodeavailable",
        alreadyverified: true,
      });
    }

    if (HR.verificationtoken && HR.verificationtokenexpires > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "Verification Code is Still Valid",
        type: "HRcodeavailable",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Invalid or Expired Verification Code",
      type: "HRcodeavailable",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
      type: "HRcodeavailable",
    });
  }
};
