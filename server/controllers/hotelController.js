const Hotel = require("../models/HotelModel");
const User = require("../models/userModel");
const VendorRequest = require("../models/VendorRequestModel");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/cloudinary");
const sendMail = require("../config/nodemailer");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// 1. Register New Hotel Request
exports.registerHotel = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only approved vendors can add hotels.",
      });
    }
    const {
      name,
      hotelType,
      description,
      address,
      starRating,
      email,
      phone,
      locationLink,
      stateId,
      districtId,
      cityId,
    } = req.body;

    let imageUrl;

    if (!req.files) {
      imageUrl = "";
    } else {
      const uploadData = await uploadImage(req.files);
      imageUrl = uploadData?.[0]?.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Hotel image is required",
      });
    }

    const existingHotel = await Hotel.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });

    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "A registration with this email already exists.",
      });
    }

    const vendorDetails = await VendorRequest.findOne({
      email: req.user.email,
    });

    if (!vendorDetails) {
      return res.status(404).json({
        success: false,
        message: "Vendor company details not found for this user.",
      });
    }

    const trackingId = uuidv4();

    const newHotel = await Hotel.create({
      name,
      hotelType,
      description,
      address,
      starRating: starRating || 3,
      email: email.toLowerCase().trim(),
      phone,
      locationLink,
      imageUrl,
      stateId,
      districtId,
      cityId,
      trackingId,
      vendorId: vendorDetails._id,
    });

    const emailBody = `
      <h2>Registration Received!</h2>
      <p>Your hotel <b>${name}</b> has been submitted for Superadmin approval.</p>      
      <p>Your unique Application Tracking ID is: <b>${trackingId}</b></p>
      <p>You can use this ID on our website to check your application status or update your details.</p>
    `;
    await sendMail.sendMail(
      email,
      "Hotel Application Pending - Tracking ID",
      emailBody,
    );

    res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. Waiting for admin approval also Check your email for your Tracking ID",
      data: newHotel,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

// 2. Get Hotels (status/isDeleted)
exports.getHotels = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    const status = req.query.status;

    let query = { isDeleted };
    if (status) query.status = status;

    if (req.user && req.user.role === "vendor") {
      query.userId = req.user._id;
    }

    const hotels = await Hotel.find(query)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
      .populate({
        path: "vendorId",
        model: "VendorRequest", // This must match name in mongoose.model("VendorRequest", ...)
        select: "companyName applicantName email phone",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All related Hotels Info fetched",
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Approve Hotel (Transaction)
/* exports.approveHotel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const hotel = await Hotel.findById(req.params.id).session(session);

    if (!hotel) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    hotel.status = "approved";
    await hotel.save({ session });

    await User.create(
      [
        {
          name: hotel.name,
          email: hotel.email,  // This is the hotel's business email
          password: hashedPassword,
          role: "hotel",
          hotelId: hotel._id,
          vendorId: hotel.vendorId // Link to parent vendor
        },
      ],
      { session },
    );

    const emailBody = `
      <h2>Hotel Live!</h2>
      <p>Your hotel <b>${hotel.name}</b> is now live on our platform.</p>
      <p>Use these credentials to log in and manage your property bookings:</p>
      <p><b>Login:</b> ${hotel.email}<br><b>Password:</b> ${generatedPassword}</p>
    `;
    await sendMail.sendMail(
      hotel.email,
      "Hotel Approved - Login Credentials",
      emailBody,
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Hotel approved and credentials sent via email.",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
}; */

// 3. Approve Hotel (Without Transaction)
exports.approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found.",
      });
    }

    if (hotel.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot approve an inactive/deleted hotel.",
      });
    }

    if (hotel.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Hotel is already approved.",
      });
    }

    const existingUser = await User.findOne({
      email: hotel.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    hotel.status = "approved";
    hotel.rejectRemark = "";
    await hotel.save();

    await User.create({
      name: hotel.name,
      email: hotel.email.toLowerCase().trim(),
      password: hashedPassword,
      role: "hotel",
      hotelId: hotel._id,
      vendorId: hotel.vendorId,
    });

    // Send credentials
    const emailBody = `
      <h2>Hotel Live!</h2>

      <p>Congratulations! Your hotel <b>${hotel.name}</b> has been approved and is now live on our platform.</p>

      <p><strong>Your Login Credentials</strong></p>

      <p>
        <b>Email:</b> ${hotel.email}<br>
        <b>Password:</b> ${generatedPassword}
      </p>

      <p>Please log in and change your password after your first login.</p>

      <p>Thank you for partnering with us.</p>
    `;

    await sendMail.sendMail(
      hotel.email,
      "Hotel Approved - Login Credentials",
      emailBody,
    );

    return res.status(200).json({
      success: true,
      message: "Hotel approved successfully. Login credentials have been sent.",
    });
  } catch (error) {
    console.error("Approve Hotel Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// 4. Reject Hotel
exports.rejectHotel = async (req, res) => {
  try {
    const { remark } = req.body;
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (!remark) {
      return res.status(400).json({ message: "Rejection remark is required" });
    }

    hotel.status = "rejected";
    hotel.rejectRemark = remark;
    await hotel.save();

    const emailBody = `
      <h2>Registration Update</h2>
      <p>We regret to inform you that your registration for <b>${hotel.name}</b> has been rejected.</p>
      <p><b>Reason:</b> ${remark}</p>
    `;
    await sendMail.sendMail(
      hotel.email,
      "Hotel Registration Status",
      emailBody,
    );

    res.status(200).json({
      success: true,
      message: "Hotel rejected and notification sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Soft Delete (Inactive)
exports.softDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json({
      success: true,
      message: "Hotel moved to inactive list",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Restore Hotel (Active)
exports.restoreHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true },
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res
      .status(200)
      .json({ message: "Hotel restored successfully", data: hotel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Hard Delete
exports.hardDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.status === "approved") {
      await User.findOneAndDelete({ hotelId: hotel._id });
    }

    await Hotel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ sucess: true, message: "Hotel permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Check Hotel Status by UUID (Tracking Id)
exports.checkHotelStatus = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ trackingId: req.params.id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Application not found. Please check your Tracking ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel data that matching the Tracking Id",
      data: hotel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error checking tracking Id" });
  }
};

// 9. Update/Re-request Hotel Registration by UUID (Tracking Id)
exports.updateHotelRequest = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ trackingId: req.params.id });

    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    if (hotel.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit an approved hotel." });
    }

    const updateData = { ...req.body };

    if (req.files) {
      const uploadData = await uploadImage(req.files);
      if (uploadData && uploadData[0]?.secure_url) {
        updateData.imageUrl = uploadData[0].secure_url;
      }
    }

    if (hotel.status === "rejected") {
      updateData.status = "pending";
      updateData.rejectRemark = "";
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(hotel._id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Application updated successfully and is pending review.",
      data: updatedHotel,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUPERADMIN: Add new Hotel with approved status
exports.superAdminAddHotel = async (req, res) => {
  try {
   if (!req.user || req.user.role !== "super_admin") {
     return res.status(403).json({ success: false, message: "Unauthorized." });
   }

    const {
      name, hotelType, description, address, starRating, 
      email, phone, locationLink, stateId, districtId, cityId, vendorId
    } = req.body;

    const hotelEmail = email.toLowerCase().trim();

    if (!vendorId) {
      return res.status(400).json({ success: false, message: "Vendor selection is required." });
    }

    const existingUser = await User.findOne({ email: hotelEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Hotel email already in use." });
    }

    const vendorRequest = await VendorRequest.findById(vendorId);
    if (!vendorRequest) {
      return res.status(404).json({ success: false, message: "Selected vendor not found." });
    }

    let imageUrl = "";
    if (req.files) {
      const uploadData = await uploadImage(req.files);
      imageUrl = uploadData?.[0]?.secure_url || "";
    }
    if (!imageUrl) return res.status(400).json({ success: false, message: "Image required." });

    const trackingId = uuidv4();
    const newHotel = await Hotel.create({
      name, hotelType, description, address, starRating,
      email: hotelEmail, phone, locationLink, stateId, districtId, cityId, imageUrl,
      trackingId,
      status: "approved", 
      vendorId: vendorRequest._id,   
    });

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await User.create({
      name: name,
      email: hotelEmail,
      password: hashedPassword,
      role: "hotel",
      hotelId: newHotel._id,
      vendorId: vendorRequest._id,
    });

    const emailBody = `
      <h2>Hotel Live!</h2>
      <p>Your hotel <b>${name}</b> has been added directly by the Admin and is live.</p>
      <p><strong>Hotel Login Credentials:</strong></p>
      <p><b>Email:</b> ${hotelEmail}<br><b>Password:</b> ${generatedPassword}</p>
    `;
    await sendMail.sendMail(hotelEmail, "Hotel Live - Login Credentials", emailBody);

    res.status(201).json({
      success: true,
      message: "Hotel created and auto-approved. Credentials sent.",
      data: newHotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
