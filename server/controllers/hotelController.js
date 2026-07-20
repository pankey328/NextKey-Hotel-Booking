const Hotel = require("../models/HotelModel");
const User = require("../models/userModel");
const VendorRequest = require("../models/VendorRequestModel");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/cloudinary");
const sendMail = require("../config/nodemailer");
const { v4: uuidv4 } = require("uuid");

// Register New Hotel
exports.registerHotel = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res
        .status(403)
        .json({ message: "Only approved vendors can add hotels." });
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
      features,
    } = req.body;

    if (
      !name ||
      !hotelType ||
      !address ||
      !email ||
      !phone ||
      !stateId ||
      !districtId ||
      !cityId
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = [];
      }
    }

    let imageUrl;
    if (!req.files) imageUrl = "";
    else {
      const uploadData = await uploadImage(req.files);
      imageUrl = uploadData?.[0]?.secure_url;
    }

    if (!imageUrl)
      return res.status(400).json({ message: "Hotel image is required" });

    const vendorDetails = await VendorRequest.findOne({
      email: req.user.email,
    });
    if (!vendorDetails)
      return res.status(404).json({ message: "Vendor details not found" });

    const existingHotel = await Hotel.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });
    if (existingHotel)
      return res.status(400).json({ message: "Email already exists" });

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
      features: parsedFeatures,
    });

    const emailBody = `
      <h2>Registration Received!</h2>
      <p>Your hotel <b>${name}</b> has been submitted for Superadmin approval.</p>      
      <p>Your Tracking ID is: <b>${trackingId}</b></p>
    `;
    await sendMail.sendMail(
      email,
      "Hotel Application Pending - Tracking ID",
      emailBody,
    );

    return res.status(201).json({
      message:
        "Registration submitted successfully. Check your email for your Tracking ID",
      data: newHotel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Hotels (status/isDeleted)
exports.getHotels = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    const status = req.query.status;

    let query = { isDeleted };
    if (status) query.status = status;

    if (req.user && req.user.role === "vendor") {
      const vendorCompany = await VendorRequest.findOne({
        email: req.user.email,
      });

      if (!vendorCompany) {
        return res.status(404).json({
          message: "Vendor profile not found",
        });
      }
      query.vendorId = vendorCompany._id;
    }

    const hotels = await Hotel.find(query)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
      .populate("vendorId", "companyName applicantName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All related Hotels Info fetched",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Approve Hotel (Transaction)
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
        .json({  message: "Hotel not found" });
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

   return res.status(200).json({
      message: "Hotel approved and credentials sent via email.",
    });
  } catch (error) {
    await session.abortTransaction();
   return res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
}; */

// Approve Hotel (Without Transaction)
exports.approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    if (hotel.isDeleted) {
      return res.status(400).json({
        message: "Cannot approve an inactive/deleted hotel",
      });
    }

    if (hotel.status === "approved") {
      return res.status(400).json({
        message: "Hotel is already approved",
      });
    }

    const existingUser = await User.findOne({
      email: hotel.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
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
      message: "Hotel approved successfully, Login credentials have been sent",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// Reject Hotel
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

    if (hotel.isDeleted) {
      return res.status(400).json({
        message: "Inactive hotel cannot be updated",
      });
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

    return res.status(200).json({
      message: "Hotel rejected and notification sent",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Soft Delete (Inactive)
exports.softDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    return res.status(200).json({
      message: "Hotel moved to inactive list",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Restore Hotel (Active)
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
    return res.status(500).json({ message: error.message });
  }
};

// Hard Delete
exports.hardDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.status === "approved") {
      await User.findOneAndDelete({ hotelId: hotel._id });
    }

    await Hotel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Hotel permanently deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Check Hotel Status by UUID (Tracking Id)
exports.checkHotelStatus = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ trackingId: req.params.id });

    if (!hotel) {
      return res.status(404).json({
        message: "Application not found check your Tracking ID",
      });
    }

    return res.status(200).json({
      message: "Hotel data matching the Tracking Id",
      data: hotel,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error checking tracking Id" });
  }
};

// Update Hotel Registration by UUID (Tracking Id)
exports.updateHotelRequest = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ trackingId: req.params.id });

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.status === "approved")
      return res.status(400).json({ message: "Cannot edit an approved hotel" });

    if (hotel.isDeleted)
      return res
        .status(400)
        .json({ message: "Inactive hotel cannot be updated" });

    const updateData = { ...req.body };

    if (updateData.features) {
      try {
        updateData.features = JSON.parse(updateData.features);
      } catch (e) {
        delete updateData.features;
      }
    }

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

    return res.status(200).json({
      message: "Application updated successfully and pending review",
      data: updatedHotel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add new Hotel with approved status (SUPERADMIN)
exports.superAdminAddHotel = async (req, res) => {
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
      vendorId,
      features,
    } = req.body;

    if (
      !name ||
      !hotelType ||
      !address ||
      !email ||
      !phone ||
      !stateId ||
      !districtId ||
      !cityId
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = [];
      }
    }

    const hotelEmail = email.toLowerCase().trim();
    if (!vendorId)
      return res.status(400).json({ message: "Vendor selection is required." });

    const existingUser = await User.findOne({ email: hotelEmail });
    if (existingUser)
      return res.status(400).json({ message: "Hotel email already in use" });

    const existingHotel = await Hotel.findOne({ email: hotelEmail });
    if (existingHotel)
      return res.status(400).json({ message: "Hotel already exists" });

    const vendorRequest = await VendorRequest.findById(vendorId);
    if (!vendorRequest)
      return res.status(404).json({ message: "Selected vendor not found" });

    let imageUrl = "";
    if (req.files) {
      const uploadData = await uploadImage(req.files);
      imageUrl = uploadData?.[0]?.secure_url || "";
    }
    if (!imageUrl) return res.status(400).json({ message: "Image required." });

    const trackingId = uuidv4();
    const newHotel = await Hotel.create({
      name,
      hotelType,
      description,
      address,
      starRating,
      email: hotelEmail,
      phone,
      locationLink,
      stateId,
      districtId,
      cityId,
      imageUrl,
      trackingId,
      status: "approved",
      vendorId: vendorRequest._id,
      features: parsedFeatures,
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
      <p><b>Email:</b> ${hotelEmail}<br><b>Password:</b> ${generatedPassword}</p>
    `;
    await sendMail.sendMail(
      hotelEmail,
      "Hotel Live - Login Credentials",
      emailBody,
    );

    return res
      .status(201)
      .json({ message: "Hotel created and auto-approved. Credentials sent." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
