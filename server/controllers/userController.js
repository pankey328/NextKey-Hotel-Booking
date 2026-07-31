const User = require("../models/userModel");
const Otp = require("../models/otpModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateOtp = require("../utils/generateOtp")
const sendMail = require("../config/nodemailer")

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(404).json({ message: "No Data Found" });
    }

    if (userExist.provider === "google") {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    const token = jwt.sign(
      {
        id: userExist._id,
        email: userExist.email,
        role: userExist.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      },
    );

    return res.status(200).json({
      message: "Login Successfull",
      token,
      user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
        theme: userExist.theme,
      },
    });
  } catch (error) {
     return res.status(500).json({
       message: error.message,
     });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { name, email, photo, uid } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: "user",
        googleId: uid,
        photo,
        provider: "google",
      });
    }

    // generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      },
    );

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        theme: user.theme,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.log("GOOGLE LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// SEND OTP (SIGNUP)
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!(name && email && password)) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const otp = generateOtp.generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);


    await Otp.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; -webkit-font-smoothing: antialiased;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
      <tr>
        <td align="center">
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin: 0 20px; border: 1px solid #f3f4f6;">
            
            <tr>
              <td style="background-color: #2563eb; padding: 35px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Security Verification</h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #374151; margin-top: 0; font-weight: 600;">Hello,</p>
                <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                  We received a request to access your account. Use the secure verification code below to complete your authentication process:
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 20px 40px;">
                    <span style="display: block; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #1d4ed8; margin-left: 12px;">
                      ${otp}
                    </span>
                  </div>
                </div>
                
                <p style="font-size: 15px; color: #4b5563; text-align: center; margin-bottom: 30px;">
                  This code will expire in <span style="font-weight: 700; color: #ef4444;">5 minutes</span>.
                </p>
                
                <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
                
                <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0;">
                  If you didn't attempt to log in or request this code, please ignore this email or contact our support team immediately to secure your account.
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                  &copy; ${new Date().getFullYear()} Your App Name. All rights reserved.
                </p>
                <p style="font-size: 12px; color: #d1d5db; margin: 10px 0 0 0;">
                  This is an automated message, please do not reply.
                </p>
              </td>
            </tr>
            
          </table>
          
        </td>
      </tr>
    </table>
    
  </body>
  </html>
    `;

    await sendMail.sendMail(email, "Signup OTP", htmlTemplate);

    return res.status(200).json({ message: "OTP sent suucessfully" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY OTP (SIGNUP)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = await Otp.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        message: "OTP not found",
      });
    }

    if (pendingUser.otp !== otp || pendingUser.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "Invalid or Expired OTP",
      });
    }

    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    });

    await Otp.deleteOne({ email });

    return res.status(201).json({
      message: "Registration Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
   return res.status(500).json({
     message: error.message,
   });
  }
};

// FORGET PASSWORD
exports.forget = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = generateOtp.generateOtp();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
          
          <div style="background-color: #000000; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Authentication Code</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello,</p>
            <p style="font-size: 16px; color: #555555; line-height: 1.5;">You requested a One-Time Password (OTP) to log in to your account. Please use the code below to proceed:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111111; background-color: #f4f4f5; padding: 15px 25px; border-radius: 8px; border: 1px solid #d1d5db;">
                ${otp}
              </span>
            </div>
            
            <p style="font-size: 14px; color: #777777; text-align: center; margin-bottom: 30px;">
              This code is valid for <strong style="color: #111;">5 minutes</strong>.
            </p>
            
            <p style="font-size: 14px; color: #666666; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px;">
              If you did not request this code, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="font-size: 12px; color: #999999; margin: 0;">
              &copy; ${new Date().getFullYear()} App. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    await sendMail.sendMail(email, "Forgot Password OTP", htmlTemplate);

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY FORGET PASSWORD
exports.verifyForget = async (req, res) => {
  try {
    const { email, otp, newpassword, confirmpassword } = req.body;

    if (!email || !otp || !newpassword || !confirmpassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "OTP not generated",
      });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({
        message: "NewPassword & ConfirmPassword must be same",
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// RESET PASSWORDS
exports.reset = async (req, res) => {
  try {
    const { email, password, newpassword, confirmpassword } = req.body;

    if (!(email && password && newpassword && confirmpassword)) {
      return res.status(400).json({ message: "All fileds are required" });
    }

    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatched = await bcrypt.compare(password, existUser.password);

    if (!isMatched) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    if (await bcrypt.compare(newpassword, existUser.password)) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } },
    );

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};