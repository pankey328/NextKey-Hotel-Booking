const VendorRequest = require("../models/VendorRequestModel");
const User = require("../models/userModel");
const Hotel = require("../models/HotelModel");
const Room = require("../models/RoomModel");
const sendMail = require("../config/nodemailer");
const { uploadImage } = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

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
      <h2>Partner Application Received!</h2>
      <p>Thank you <b>${applicantName}</b> for applying to be a partner.</p>
      <p>Your Tracking ID is: <b>${trackingId}</b></p>
    `;
    await sendMail.sendMail(
      email,
      "Partner Registration - Tracking ID",
      emailBody,
    );

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
    const { status, search, sortBy } = req.query;

    let query = { isDeleted };
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { applicantName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = { createdAt: -1 };

    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "company_asc") sortObj = { companyName: 1 };
    if (sortBy === "company_desc") sortObj = { companyName: -1 };
    if (sortBy === "applicant_asc") sortObj = { applicantName: 1 };
    if (sortBy === "applicant_desc") sortObj = { applicantName: -1 };

    const requests = await VendorRequest.find(query).sort(sortObj);

    return res
      .status(200)
      .json({ message: "All vendor requests fetched", data: requests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Approve = SUPERADMIN (Transaction)

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

    if (vendorReq.status === "approved") {
      throw new Error("Vendor is already approved");
    }

    const existingUser = await User.findOne({
      email: vendorReq.email,
    }).session(session);

    if (existingUser) {
      throw new Error("A user with this email already exists");
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
          email: vendorReq.email,
          password: hashedPassword,
          role: "vendor",
        },
      ],
      { session },
    );

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

    return res.status(200).json({
      message:
        "Vendor approved successfully. Login credentials have been sent via email",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      message: error.message,
    });
  } finally {
    session.endSession();
  }
}; */

// Approve = SUPERADMIN (Without Transaction)
exports.approveVendor = async (req, res) => {
  try {
    const vendorReq = await VendorRequest.findById(req.params.id);

    if (!vendorReq) {
      return res.status(404).json({
        message: "Vendor request not found",
      });
    }

    if (vendorReq.isDeleted) {
      return res.status(400).json({
        message: "Cannot approve an inactive vendor request",
      });
    }

    if (vendorReq.status === "approved") {
      return res.status(400).json({
        message: "Vendor is already approved",
      });
    }

    const existingUser = await User.findOne({
      email: vendorReq.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
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
      message:
        "Vendor approved successfully. Login credentials have been sent via email",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
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
      <h2>Welcome to our Platform!</h2>
      <p>Your Vendor account for <b>${companyName}</b> has been created by the Admin.</p>
      <p><strong>Your Login Credentials:</strong></p>
      <p><b>Email:</b> ${vendorEmail}<br><b>Password:</b> ${generatedPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `;

    await sendMail.sendMail(vendorEmail, "Vendor Account Created", emailBody);

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
