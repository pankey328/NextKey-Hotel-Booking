const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateOtp = require("../utils/generateOtp");
const { sendMail } = require("../utils/sendMail");

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
        <title>Security Verification</title>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 30px 40px; border-bottom: 1px solid #f3f4f6;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      NextKey <span style="color: #2563eb; font-weight: 500; font-style: italic;">App</span>
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Status Badge -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Authentication Code
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      We received a request to access your account. Please use the secure verification code below to complete your login process:
                    </p>

                    <!-- Highlighted OTP Box -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 48px;">
                        <span style="display: block; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; margin-left: 12px; font-family: monospace;">
                          ${otp}
                        </span>
                      </div>
                    </div>

                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px; text-align: center;">
                      This code is valid for <strong style="color: #e11d48;">5 minutes</strong>.
                    </p>

                    <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>

                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 22px;">
                      If you didn't attempt to log in or request this code, please ignore this email or contact support immediately to secure your account.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
                      <br><br>
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

    await sendMail(email, "Signup OTP", htmlTemplate);

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Code</title>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 30px 40px; border-bottom: 1px solid #f3f4f6;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      NextKey <span style="color: #2563eb; font-weight: 500; font-style: italic;">App</span>
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Status Badge (Purple for Password Reset) -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #f3e8ff; color: #7e22ce; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Password Reset
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      You requested a One-Time Password (OTP) to log in to your account. Please use the code below to proceed:
                    </p>

                    <!-- Highlighted OTP Box -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 48px;">
                        <span style="display: block; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; margin-left: 12px; font-family: monospace;">
                          ${otp}
                        </span>
                      </div>
                    </div>

                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px; text-align: center;">
                      This code is valid for <strong style="color: #e11d48;">5 minutes</strong>.
                    </p>

                    <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>

                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 22px;">
                      If you did not request this code, please ignore this email or contact support if you have concerns.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
                      <br><br>
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

    await sendMail(email, "Forgot Password OTP", htmlTemplate);

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
