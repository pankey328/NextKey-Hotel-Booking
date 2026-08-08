const Hotel = require("../models/HotelModel");
const User = require("../models/userModel");
const VendorRequest = require("../models/VendorRequestModel");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/cloudinary");
const { sendMail } = require("../utils/sendMail");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received</title>
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
                        Application Submitted
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thank you for applying to list your property with NextKey. We have successfully received the registration request for <strong style="color: #111827;">${name}</strong>.
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
                      Our superadmin team is currently reviewing your submission. You will receive another email as soon as your property is approved and your vendor credentials are generated.
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
    await sendMail(email, "Hotel Application Pending - Tracking ID", emailBody);

    return res.status(201).json({
      message:
        "Registration submitted successfully. Check your email for your Tracking ID",
      data: newHotel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get All Hotels (status/isDeleted) VENDOR/SUPERADMIN
exports.getHotels = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    const {
      status,
      search,
      sortBy,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = req.query;

    let query = { isDeleted };
    if (status) query.status = status;

    // Date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Seaching
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { hotelType: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

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

    // Sorting
    let sortObj = { createdAt: -1 };

    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "name_asc") sortObj = { name: 1 };
    if (sortBy === "name_desc") sortObj = { name: -1 };

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const hotels = await Hotel.find(query)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
      .populate("vendorId", "companyName applicantName email phone")
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum);

    const totalItems = await Hotel.countDocuments(query);

    return res.status(200).json({
      message: "All related Hotels Info fetched",
      data: hotels,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Approve Hotel (Without Transaction)
exports.approveHotel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hotel = await Hotel.findById(req.params.id).session(session);

    if (!hotel) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    if (hotel.isDeleted) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cannot approve an inactive/deleted hotel",
      });
    }

    if (hotel.status === "approved") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Hotel is already approved",
      });
    }

    const existingUser = await User.findOne({
      email: hotel.email.toLowerCase().trim(),
    }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    const generatedPassword = uuidv4().slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    hotel.status = "approved";
    hotel.rejectRemark = "";
    await hotel.save({ session });

    await User.create(
      [
        {
          name: hotel.name,
          email: hotel.email.toLowerCase().trim(),
          password: hashedPassword,
          role: "hotel",
          hotelId: hotel._id,
          vendorId: hotel.vendorId,
        },
      ],
      { session },
    );

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

    await sendMail(
      hotel.email,
      "Hotel Approved - Login Credentials",
      emailBody,
    );

    await session.commitTransaction();

    return res.status(200).json({
      message: "Hotel approved successfully, Login credentials have been sent",
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Update</title>
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
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thank you for your interest in listing your property with NextKey. After carefully reviewing your application, we regret to inform you that your registration for <strong style="color: #111827;">${hotel.name}</strong> has been declined at this time.
                    </p>

                    <!-- Highlighted Reason Box (Soft Red Tint) -->
                    <div style="background-color: #fffafb; border: 1px solid #fecdd3; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; color: #e11d48; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Reason for Rejection
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500; line-height: 24px;">
                        ${remark}
                      </p>
                    </div>

                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                      You are welcome to address the issue(s) mentioned above and submit a new application when you are ready. 
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
    await sendMail(hotel.email, "Hotel Registration Status", emailBody);

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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hotel Live - Account Created</title>
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
                    
                    <!-- Status Badge (Emerald/Green for Live/Success) -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <span style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Account Active & Live
                      </span>
                    </div>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 24px;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Great news! Your property <strong style="color: #111827;">${name}</strong> has been successfully onboarded by our admin team and is now live on the NextKey platform. You can now log in to your vendor dashboard to manage your profile and bookings.
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
                            <strong style="color: #111827; font-size: 15px;">${hotelEmail}</strong>
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
                      * For security purposes, we strongly recommend changing this password immediately after your first login.
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
                      You are receiving this email because an admin registered your property on NextKey. If you did not authorize this, please contact support immediately.
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
    await sendMail(hotelEmail, "Hotel Live - Login Credentials", emailBody);

    return res
      .status(201)
      .json({ message: "Hotel created and auto-approved. Credentials sent." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
