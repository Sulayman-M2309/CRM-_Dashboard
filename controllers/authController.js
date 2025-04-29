import UserModels from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator"; //
import aleaRNGFactory from "number-generator";

// Importing otp-generator for OTP generation
// sign up
import sendEmail from "../helpers/sendEmail.js"; // Correct import

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user already exists
    const existingUser = await UserModels.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "You already have an account.", success: false });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random OTP

    // Create new user
    const newUser = new UserModels({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
    });

    await newUser.save();

    // Send OTP Email
    await sendEmail(email, otp);

    // Generate JWT token (optional after signup)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_Scret,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Signup failed", success: false, error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists in the database
    const user = await UserModels.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user Not Fount", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid Password", success: false });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_Scret,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: false, error: error.message });
  }
};
// otp verification});
async function VerifyOtpController(req, res) {
  const { email, otp } = req.body;
  try {
    const existinguser = await UserModels.findOne({ email });
    if (existinguser) {
      if (existinguser.otp == otp) {
        (existinguser.isverify = true), (existinguser.otp = null);
        await existinguser.save();
        res.status(200).json({ success: true, msg: "otp successful" });
      } else {
        res.status(404).json({ error: "otp invalid", success: false });
      }
    } else {
      res.status(404).json({ error: "user not found", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message ? error.message : message, success: false });
  }
}

export { login, signup, VerifyOtpController };
