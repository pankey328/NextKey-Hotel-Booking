const Coupon = require("../models/CouponModel");
const Hotel = require("../models/HotelModel");

// Create Coupon
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
      !discount ||
      !maxDiscount ||
      !minPrice ||
      !availFrom ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (new Date(expiryDate) <= new Date(availFrom)) {
      return res.status(400).json({
        message: "Expiry date must be after the 'Available From' date.",
      });
    }

    const hotelExists = await Hotel.findById(hotelId);
    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const couponCode = code.toUpperCase().trim();
    const existingCoupon = await Coupon.findOne({
      hotelId,
      code: couponCode,
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: `Coupon already exists for this hotel`,
      });
    }

    const newCoupon = await Coupon.create({
      hotelId,
      code: couponCode,
      discount,
      maxDiscount,
      minPrice,
      availFrom,
      expiryDate,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Coupon created successfully.",
      data: newCoupon,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Coupons
exports.getHotelCoupons = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { search, sortBy } = req.query;

    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required" });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const isDeleted = req.query.isDeleted === "true";
    let filter = { hotelId, isDeleted };

    if (search) {
      filter.code = {
        $regex: search,
        $options: "i",
      };
    }

    let sortObj = { createdAt: -1 }; // default newest first

    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "discount_desc") sortObj = { discount: -1 };
    if (sortBy === "discount_asc") sortObj = { discount: 1 };
    if (sortBy === "expiry_asc") sortObj = { expiryDate: 1 };
    if (sortBy === "expiry_desc") sortObj = { expiryDate: -1 };

    const coupons = await Coupon.find(filter).sort(sortObj);

    return res.status(200).json({ data: coupons });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (
      req.body.code &&
      req.body.code.toUpperCase().trim() !== existingCoupon.code
    ) {
      const couponCode = req.body.code.toUpperCase().trim();
      const duplicate = await Coupon.findOne({
        hotelId: existingCoupon.hotelId,
        code: couponCode,
      });

      if (duplicate) {
        return res.status(400).json({
          message: "This coupon code already exists for this hotel",
        });
      }
      req.body.code = couponCode;
    }

    const newAvailFrom = req.body.availFrom
      ? new Date(req.body.availFrom)
      : existingCoupon.availFrom;

    const newExpiryDate = req.body.expiryDate
      ? new Date(req.body.expiryDate)
      : existingCoupon.expiryDate;

    if (newExpiryDate <= newAvailFrom) {
      return res.status(400).json({
        message: "Expiry date must be after the 'Available From' date",
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Soft Delete
exports.softDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    return res.status(200).json({
      message: "Coupon successfully moved to trash",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Restore Coupon
exports.restoreCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true },
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    return res.status(200).json({
      message: "Coupon successfully restored",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Hard Delete
exports.hardDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({
        message: "Coupon not found or already deleted",
      });
    }

    return res.status(200).json({ message: "Coupon permanently deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
