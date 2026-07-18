const mongoose = require("mongoose");
const VendorRequest = require("../models/VendorRequestModel");
const User = require("../models/userModel");
const Hotel = require("../models/HotelModel");
const Room = require("../models/RoomModel");
const sendMail = require("../config/nodemailer");
const { uploadImage } = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// 1. PUBLIC: Register as a Vendor
exports.registerVendor = async (req, res) => {
  try {
    const { companyName, applicantName, email, phone } = req.body;

    const existingReq = await VendorRequest.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: "A request with this email already exists.",
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
      <h2>Partner Application Received!</h2>
      <p>Thank you <b>${applicantName}</b> for applying to be a partner.</p>
      <p>Your Tracking ID is: <b>${trackingId}</b></p>
    `;
    await sendMail.sendMail(
      email,
      "Partner Registration - Tracking ID",
      emailBody,
    );

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. SUPERADMIN: Get Vendor Requests
exports.getVendorRequests = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    let query = { isDeleted };
    if (req.query.status) query.status = req.query.status;

    const requests = await VendorRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. SUPERADMIN: Approve Vendor (Transaction)

/* exports.approveVendor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vendorReq = await VendorRequest.findById(req.params.id).session(
      session,
    );

    if (!vendorReq) {
      throw new Error("Vendor request not found");
    }

    // Prevent duplicate approval
    if (vendorReq.status === "approved") {
      throw new Error("Vendor is already approved.");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: vendorReq.email,
    }).session(session);

    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // Generate password
    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Update vendor request
    vendorReq.status = "approved";
    vendorReq.rejectRemark = "";
    await vendorReq.save({ session });

    // Create Vendor User
    await User.create(
      [
        {
          name: vendorReq.applicantName,
          email: vendorReq.email,
          password: hashedPassword,
          role: "vendor",

        },
      ],
      { session },
    );

    // Send credentials
    const emailBody = `
      <h2>Welcome to Our Platform!</h2>

      <p>Dear <b>${vendorReq.applicantName}</b>,</p>

      <p>Your vendor application has been <b>approved</b>.</p>

      <p><b>Login Credentials</b></p>

      <p>
        <b>Email:</b> ${vendorReq.email}<br>
        <b>Password:</b> ${generatedPassword}
      </p>

      <p>Please log in and change your password immediately after your first login.</p>

      <p>Thank you for partnering with us.</p>
    `;

    await sendMail.sendMail(
      vendorReq.email,
      "Vendor Account Approved",
      emailBody,
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message:
        "Vendor approved successfully. Login credentials have been sent via email.",
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
}; */

// 3. SUPERADMIN: Approve Vendor (Without Transaction)
exports.approveVendor = async (req, res) => {
  try {
    const vendorReq = await VendorRequest.findById(req.params.id);

    if (!vendorReq) {
      return res.status(404).json({
        success: false,
        message: "Vendor request not found.",
      });
    }

    if (vendorReq.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot approve an inactive/deleted vendor request.",
      });
    }

    if (vendorReq.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Vendor is already approved.",
      });
    }

    const existingUser = await User.findOne({
      email: vendorReq.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    vendorReq.status = "approved";
    vendorReq.rejectRemark = "";
    await vendorReq.save();

    await User.create({
      name: vendorReq.applicantName,
      email: vendorReq.email.toLowerCase().trim(),
      password: hashedPassword,
      role: "vendor",
    });

    const emailBody = `
      <h2>Welcome to Our Platform!</h2>

      <p>Dear <b>${vendorReq.applicantName}</b>,</p>

      <p>Your vendor application has been <b>approved</b>.</p>

      <p><strong>Your Login Credentials</strong></p>

      <p>
        <b>Email:</b> ${vendorReq.email}<br>
        <b>Password:</b> ${generatedPassword}
      </p>

      <p>Please log in and change your password immediately after your first login.</p>

      <p>Thank you for partnering with us.</p>
    `;

    await sendMail.sendMail(
      vendorReq.email,
      "Vendor Account Approved",
      emailBody,
    );

    return res.status(200).json({
      success: true,
      message:
        "Vendor approved successfully. Login credentials have been sent via email.",
    });
  } catch (error) {
    console.error("Approve Vendor Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// 4. SUPERADMIN: Reject Vendor
exports.rejectVendor = async (req, res) => {
  try {
    const { remark } = req.body;

    const vendorReq = await VendorRequest.findById(req.params.id);

    if (!vendorReq) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor request not found" });
    }

    if (!remark) {
      return res.status(400).json({
        success: false,
        message: "Rejection remark is required",
      });
    }

    vendorReq.status = "rejected";
    vendorReq.rejectRemark = remark;

    await vendorReq.save();

    const emailBody = `
      <h2>Vendor Application Update</h2>
      <p>Dear <b>${vendorReq.applicantName}</b>,</p>
      <p>Unfortunately, your vendor application has been rejected.</p>
      <p><b>Reason:</b> ${remark}</p>
      <p>You may update your application and submit it again using your Tracking ID.</p>
      <p><b>Tracking ID:</b> ${vendorReq.trackingId}</p>
    `;

    await sendMail.sendMail(
      vendorReq.email,
      "Vendor Application Status",
      emailBody,
    );

    res.status(200).json({
      success: true,
      message: "Vendor request rejected and email sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. SUPERADMIN: Soft Delete Vendor
exports.softDeleteVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor moved to inactive list",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. SUPERADMIN: Restore Vendor
exports.restoreVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true },
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor restored successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. SUPERADMIN: Hard Delete Vendor
exports.hardDeleteVendor = async (req, res) => {
  try {
    const vendor = await VendorRequest.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor request not found",
      });
    }

    if (vendor.status === "approved") {
      await User.findOneAndDelete({
        email: vendor.email,
      });
    }

    await VendorRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vendor permanently deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. PUBLIC: Check Vendor Status by Tracking ID
exports.checkVendorStatus = async (req, res) => {
  try {
    const vendor = await VendorRequest.findOne({
      trackingId: req.params.id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Application not found. Please check your Tracking ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor application found",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error checking tracking ID",
    });
  }
};

// 9. PUBLIC: Update Vendor Request by Tracking ID
exports.updateVendorRequest = async (req, res) => {
  try {
    const vendor = await VendorRequest.findOne({
      trackingId: req.params.id,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor request not found",
      });
    }

    if (vendor.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit an approved vendor.",
      });
    }

    const updateData = { ...req.body };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    if (vendor.status === "rejected") {
      updateData.status = "pending";
      updateData.rejectRemark = "";
    }

    const updatedVendor = await VendorRequest.findByIdAndUpdate(
      vendor._id,
      updateData,
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Vendor application updated successfully and is pending review.",
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10. SUPERADMIN: Add new vendor with approved status
exports.superAdminAddVendor = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { companyName, applicantName, email, phone } = req.body;
    const vendorEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: vendorEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use." });
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
      <h2>Welcome to our Platform!</h2>
      <p>Your Vendor account for <b>${companyName}</b> has been created by the Admin.</p>
      <p><strong>Your Login Credentials:</strong></p>
      <p><b>Email:</b> ${vendorEmail}<br><b>Password:</b> ${generatedPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `;
    await sendMail.sendMail(vendorEmail, "Vendor Account Created", emailBody);

    res.status(201).json({
      success: true,
      message: "Vendor created and auto-approved. Credentials sent.",
      data: newVendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 11. VENDOR: Add Room to a Specific Hotel
exports.vendorCreateRoom = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can add rooms using this route.",
      });
    }

    const { roomNumber, pricePerNight, hotelId } = req.body;

    if (!roomNumber || !pricePerNight || !hotelId) {
      return res.status(400).json({
        success: false,
        message: "Room Number, Price Per Night, and Hotel ID are required.",
      });
    }

    const vendor = await VendorRequest.findOne({ email: req.user.email });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found.",
      });
    }

    const hotel = await Hotel.findOne({ _id: hotelId, vendorId: vendor._id });
    if (!hotel) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized. This hotel does not belong to your vendor account.",
      });
    }

    let parsedFacilities = [];
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid format for facilities. Must be a valid JSON array.",
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

    res.status(201).json({
      success: true,
      message: "Room successfully added to your hotel.",
      data: newRoom,
    });
  } catch (error) {
    console.error("Error in vendorCreateRoom:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
