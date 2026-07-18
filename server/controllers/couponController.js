const Coupon = require("../models/CouponModel");
const Hotel = require("../models/HotelModel");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Create Coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      hotelId,
      code,
      discount,
      maxDiscount,
      minPrice,
      availFrom,
      expiryDate,
      status,
    } = req.body;

    if (
      !hotelId ||
      !code ||
      discount == null ||
      maxDiscount == null ||
      minPrice == null ||
      !availFrom ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (!isValidObjectId(hotelId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Hotel ID format." });
    }

    if (new Date(expiryDate) <= new Date(availFrom)) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after the 'Available From' date.",
      });
    }

    const hotelExists = await Hotel.findById(hotelId);
    if (!hotelExists) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found." });
    }

    const formattedCode = code.toUpperCase().trim();
    const existingCoupon = await Coupon.findOne({
      hotelId,
      code: formattedCode,
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: `The coupon code '${formattedCode}' already exists for this hotel.`,
      });
    }

    const newCoupon = await Coupon.create({
      hotelId,
      code: formattedCode,
      discount,
      maxDiscount,
      minPrice,
      availFrom,
      expiryDate,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: newCoupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Coupons for a Hotel
exports.getHotelCoupons = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!isValidObjectId(hotelId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Hotel ID format." });
    }

    const isDeleted = req.query.isDeleted === "true";

    const coupons = await Coupon.find({ hotelId, isDeleted }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon ID." });
    }

    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });
    }

    if (
      req.body.code &&
      req.body.code.toUpperCase().trim() !== existingCoupon.code
    ) {
      const formattedCode = req.body.code.toUpperCase().trim();
      const duplicate = await Coupon.findOne({
        hotelId: existingCoupon.hotelId,
        code: formattedCode,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "This coupon code already exists for this hotel.",
        });
      }
      req.body.code = formattedCode;
    }

    const newAvailFrom = req.body.availFrom
      ? new Date(req.body.availFrom)
      : existingCoupon.availFrom;

    const newExpiryDate = req.body.expiryDate
      ? new Date(req.body.expiryDate)
      : existingCoupon.expiryDate;

    if (newExpiryDate <= newAvailFrom) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after the 'Available From' date.",
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      data: updatedCoupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Soft Delete (Move to Trash)
exports.softDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon ID." });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Coupon successfully moved to trash.",
        data: coupon,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Restore Coupon
exports.restoreCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon ID." });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true },
    );

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Coupon successfully restored.",
        data: coupon,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Hard Delete
exports.hardDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon ID." });
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or already deleted.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Coupon permanently deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
