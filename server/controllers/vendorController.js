const VendorRequest = require("../models/VendorModel");
const User = require("../models/userModel");
const Hotel = require("../models/HotelModel");
const Room = require("../models/RoomModel");
const { sendMail } = require("../utils/sendMail");
const { uploadImage } = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// Register a Vendor(admin)
exports.registerVendor = async (req, res) => {
  try {
    const { companyName, applicantName, email, phone } = req.body;

    if (!email || !companyName || !applicantName || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingReq = await VendorRequest.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingReq) {
      return res.status(400).json({
        message: "A request with this email already exists",
      });
    }

    const trackingId = uuidv4();
    const newRequest = await VendorRequest.create({
      companyName,
      applicantName,
      email: email.toLowerCase().trim(),
      phone,
      trackingId,
    });

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partner Application Received</title>
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
                      <span style="display: inline-block; background-color: #dbeafe; color: #1d4ed8; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Application Received
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello <strong style="color: #111827;">${applicantName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thank you for applying to become a partner with NextKey. We have successfully received your application and it is currently in our queue for review.
                    </p>

                    <!-- Highlighted Tracking ID Box -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Your Tracking ID
                      </p>
                      <p style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 2px;">
                        ${trackingId}
                      </p>
                    </div>

                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      Our team will evaluate your details shortly. You can use this Tracking ID to reference your application if you need to contact support. We will send you another email as soon as there is an update on your status.
                    </p>

                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      Best regards,<br>
                      <strong style="color: #111827;">The NextKey Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      If you have any questions, keep your tracking ID handy and reply to this email.
                      <br><br>
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
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
    await sendMail(email, "Partner Registration - Tracking ID", emailBody);

    return res.status(201).json({
      message: "Registration submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Requests (SUPERADMIN)
exports.getVendorRequests = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    const {
      status,
      search,
      sortBy,
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    let query = { isDeleted };
    if (status) query.status = status;

    // date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Searching
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { applicantName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 };

    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "company_asc") sortObj = { companyName: 1 };
    if (sortBy === "company_desc") sortObj = { companyName: -1 };
    if (sortBy === "applicant_asc") sortObj = { applicantName: 1 };
    if (sortBy === "applicant_desc") sortObj = { applicantName: -1 };

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const requests = await VendorRequest.find(query)
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum);

    const totalItems = await VendorRequest.countDocuments(query);

    return res.status(200).json({
      message: "All vendor requests fetched",
      data: requests,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Approve = SUPERADMIN (With Transaction)
exports.approveVendor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vendorReq = await VendorRequest.findById(req.params.id).session(
      session,
    );

    if (!vendorReq) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    if (vendorReq.isDeleted) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cannot approve an inactive vendor request",
      });
    }

    if (vendorReq.status === "approved") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Vendor is already approved",
      });
    }

    const existingUser = await User.findOne({
      email: vendorReq.email.toLowerCase().trim(),
    }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    vendorReq.status = "approved";
    vendorReq.rejectRemark = "";
    await vendorReq.save({ session });

    await User.create(
      [
        {
          name: vendorReq.applicantName,
          email: vendorReq.email.toLowerCase().trim(),
          password: hashedPassword,
          role: "vendor",
        },
      ],
      { session },
    );

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Platform</title>
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
                    
                    <!-- Status Badge (Emerald/Green for Approval) -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Application Approved
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Dear <strong style="color: #111827;">${vendorReq.applicantName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Welcome to NextKey! We are thrilled to inform you that your partner application has been successfully reviewed and <strong>approved</strong>. You can now log in to the vendor dashboard to manage your properties and bookings.
                    </p>

                    <!-- Highlighted Credentials Box -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Your Login Credentials
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding-bottom: 12px; width: 90px;">
                            <span style="color: #64748b; font-size: 15px;">Email:</span>
                          </td>
                          <td style="padding-bottom: 12px;">
                            <strong style="color: #111827; font-size: 15px;">${vendorReq.email}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span style="color: #64748b; font-size: 15px;">Password:</span>
                          </td>
                          <td>
                            <span style="display: inline-block; color: #0f172a; font-size: 16px; font-weight: 600; font-family: monospace; letter-spacing: 1px; background-color: #e2e8f0; padding: 6px 10px; border-radius: 6px;">
                              ${generatedPassword}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 30px 0; color: #e7662c; font-size: 14px; line-height: 20px; font-weight: 500;">
                      * For security purposes, please log in and change your password immediately after your first session.
                    </p>

                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      Thank you for partnering with us.<br><br>
                      Best regards,<br>
                      <strong style="color: #111827;">The NextKey Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      You are receiving this email because your partner application with NextKey was approved.
                      <br><br>
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
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

    await sendMail(vendorReq.email, "Vendor Account Approved", emailBody);

    await session.commitTransaction();

    return res.status(200).json({
      message:
        "Vendor approved successfully. Login credentials have been sent via email",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  } finally {
    session.endSession();
  }
};

// Reject (SUPERADMIN)
exports.rejectVendor = async (req, res) => {
  try {
    const { remark } = req.body;

    const vendorReq = await VendorRequest.findById(req.params.id);

    if (!vendorReq) {
      return res.status(404).json({ message: "Vendor request not found" });
    }

    if (!remark) {
      return res.status(400).json({
        message: "Rejection remark is required",
      });
    }

    vendorReq.status = "rejected";
    vendorReq.rejectRemark = remark;

    await vendorReq.save();

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vendor Application Update</title>
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
                    
                    <!-- Status Badge (Rose/Red for Rejected) -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Application Rejected
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Dear <strong style="color: #111827;">${vendorReq.applicantName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thank you for your interest in partnering with NextKey. After carefully reviewing your vendor application, we regret to inform you that it has been declined at this time.
                    </p>

                    <!-- Highlighted Reason Box (Soft Red Tint) -->
                    <div style="background-color: #fffafb; border: 1px solid #fecdd3; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px 0; color: #e11d48; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Reason for Rejection
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500; line-height: 24px;">
                        ${remark}
                      </p>
                    </div>

                    <!-- Tracking ID Box (Standard Gray) -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Your Tracking ID
                      </p>
                      <p style="margin: 0; color: #0f172a; font-size: 20px; font-weight: 700; font-family: monospace; letter-spacing: 1.5px;">
                        ${vendorReq.trackingId}
                      </p>
                    </div>

                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      You are welcome to update your application details addressing the feedback above and submit it again using your Tracking ID.
                    </p>

                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      Best regards,<br>
                      <strong style="color: #111827;">The NextKey Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      If you believe this decision was made in error or need further clarification, please reply to this email to contact support.
                      <br><br>
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
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

    await sendMail(vendorReq.email, "Vendor Application Status", emailBody);

    return res.status(200).json({
      message: "Vendor request rejected and email sent",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Soft Delete (SUPERADMIN)
exports.softDeleteVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    return res.status(200).json({
      message: "Vendor moved to inactive list",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Restore (SUPERADMIN)
exports.restoreVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true },
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    return res.status(200).json({
      message: "Vendor restored successfully",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Hard Delete (SUPERADMIN)
exports.hardDeleteVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    if (vendor.status === "approved") {
      await User.findOneAndDelete({
        email: vendor.email,
      });
    }

    await VendorRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Vendor permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Check Vendor Status by Tracking ID (PUBLIC)
exports.checkVendorStatus = async (req, res) => {
  try {
    const vendor = await VendorRequest.findOne({
      trackingId: req.params.id,
    });

    if (!vendor) {
      return res.status(404).json({
        message: "Application not found. Please check your Tracking ID",
      });
    }

    return res.status(200).json({
      message: "Vendor application found",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Side Error",
    });
  }
};

// Update Vendor Request by Tracking ID (PUBLIC)
exports.updateVendorRequest = async (req, res) => {
  try {
    const vendorReq = await VendorRequest.findOne({
      trackingId: req.params.id,
    });

    if (!vendorReq) {
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    if (vendorReq.status === "approved") {
      return res.status(400).json({
        message: "Cannot edit an approved vendor",
      });
    }

    const updateData = { ...req.body };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    if (vendorReq.status === "rejected") {
      updateData.status = "pending";
      updateData.rejectRemark = "";
    }

    const updatedVendor = await VendorRequest.findByIdAndUpdate(
      vendorReq._id,
      updateData,
      { new: true },
    );

    return res.status(200).json({
      message: "Vendor application updated successfully and is pending review",
      data: updatedVendor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add new vendor with approved status (SUPERADMIN)
exports.superAdminAddVendor = async (req, res) => {
  try {
    const { companyName, applicantName, email, phone } = req.body;

    if (!companyName || !applicantName || !email || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const vendorEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: vendorEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const trackingId = uuidv4();
    const newVendor = await VendorRequest.create({
      companyName,
      applicantName,
      email: vendorEmail,
      phone,
      status: "approved",
      trackingId,
    });

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await User.create({
      name: applicantName,
      email: vendorEmail,
      password: hashedPassword,
      role: "vendor",
      companyName,
      phone,
    });

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Platform</title>
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
                    
                    <!-- Status Badge (Emerald/Green for Success/Creation) -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Account Created
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Welcome to NextKey! Your vendor account for <strong style="color: #111827;">${companyName}</strong> has been successfully created by our admin team. You now have full access to log in and manage your platform operations.
                    </p>

                    <!-- Highlighted Credentials Box -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Your Login Credentials
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding-bottom: 12px; width: 90px;">
                            <span style="color: #64748b; font-size: 15px;">Email:</span>
                          </td>
                          <td style="padding-bottom: 12px;">
                            <strong style="color: #111827; font-size: 15px;">${vendorEmail}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span style="color: #64748b; font-size: 15px;">Password:</span>
                          </td>
                          <td>
                            <span style="display: inline-block; color: #0f172a; font-size: 16px; font-weight: 600; font-family: monospace; letter-spacing: 1px; background-color: #e2e8f0; padding: 6px 10px; border-radius: 6px;">
                              ${generatedPassword}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 30px 0; color: #e7662c; font-size: 14px; line-height: 20px; font-weight: 500;">
                      * For security purposes, we strongly recommend logging in and changing this password immediately.
                    </p>

                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      We are excited to have you on board.<br><br>
                      Best regards,<br>
                      <strong style="color: #111827;">The NextKey Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                      You are receiving this email because an admin registered your company on the NextKey platform.
                      <br><br>
                      &copy; ${new Date().getFullYear()} NextKey Hospitality. All rights reserved.
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

    await sendMail(vendorEmail, "Vendor Account Created", emailBody);

    return res.status(201).json({
      message: "Vendor created Successfully, Credentials sent to Mail ID",
      data: newVendor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Room to a Specific Hotel (VENDOR)
exports.vendorCreateRoom = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({
        message: "Only vendors can add rooms using this route",
      });
    }
    const { roomNumber, pricePerNight, hotelId } = req.body;

    if (!roomNumber || !pricePerNight || !hotelId) {
      return res.status(400).json({
        message: "Room Number, Price Per Night, and Hotel ID are required",
      });
    }

    const vendor = await VendorRequest.findOne({ email: req.user.email });
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor profile not found.",
      });
    }

    const hotel = await Hotel.findOne({ _id: hotelId, vendorId: vendor._id });
    if (!hotel) {
      return res.status(403).json({
        message:
          "Not authorized. This hotel does not belong to your vendor account",
      });
    }

    let parsedFacilities = [];
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid format for facilities",
        });
      }
    }

    let imageUrls = [];
    if (req.files) {
      const uploadData = await uploadImage(req.files);
      if (uploadData && Array.isArray(uploadData)) {
        imageUrls = uploadData.map((data) => data.secure_url);
      }
    }

    const newRoom = await Room.create({
      ...req.body,
      hotelId: hotel._id,
      facilities: parsedFacilities,
      images: imageUrls,
    });

    return res.status(201).json({
      message: "Room successfully added to your hotel",
      data: newRoom,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
