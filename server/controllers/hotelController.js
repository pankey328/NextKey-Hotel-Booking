const Hotel = require("../models/HotelModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/cloudinary");
const sendMail = require("../config/nodemailer");

// 1. Register New Hotel Request
exports.registerHotel = async (req, res) => {
  try {
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
    } 
    else {
      const uploadData = await uploadImage(req.files);
      imageUrl = uploadData?.[0]?.secure_url;
      //   console.log("uploadData", uploadData);
      //   console.log("imageUrl", imageUrl);
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
    });

    res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. Waiting for admin approval.",
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

    const hotels = await Hotel.find(query)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
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

// 3. Approve Hotel
exports.approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    hotel.status = "approved";
    await hotel.save();

    await User.create({
      name: hotel.name,
      email: hotel.email,
      password: hashedPassword,
      role: "hotel_admin",
      hotelId: hotel._id,
    });

    const emailBody = `
      <h2>Congratulations!</h2>
      <p>Your hotel registration for <b>${hotel.name}</b> has been approved.</p>
      <p>Here are your login credentials:</p>
      <p><b>Email:</b> ${hotel.email}</p>
      <p><b>Password:</b> ${generatedPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `;
    await sendMail.sendMail(
      hotel.email,
      "Hotel Approved - Login Credentials",
      emailBody,
    );

    res.status(200).json({
      success: true,
      message: "Hotel approved and credentials sent via email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
