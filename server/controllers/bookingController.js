const Booking = require("../models/BookingModel");

exports.createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      couponId,
      checkInDate,
      checkOutDate,
      totalDays,
      originalPrice,
      finalPrice,
    } = req.body;

    const userId = req.user.id;

    if (!hotelId || !roomId || !checkInDate || !checkOutDate || !totalDays) {
      return res
        .status(400)
        .json({ message: "Missing required booking details" });
    }

    const newBooking = new Booking({
      userId,
      hotelId,
      roomId,
      couponId: couponId || null,
      checkInDate,
      checkOutDate,
      totalDays,
      originalPrice,
      finalPrice,
      status: "pending",
    });

    await newBooking.save();

    return res.status(201).json({
      message: "Booking request submitted successfully",
      data: newBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
