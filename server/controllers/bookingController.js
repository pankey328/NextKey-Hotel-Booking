const Booking = require("../models/BookingModel");

// Creates new booking
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

// Get all bookings for the logged-in User
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate("hotelId", "name imageUrl cityId")
      .populate("roomId", "roomType images")
      .populate("couponId", "code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All Bookings for logged-in user fetched",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a Hotel (Hotel/Vendor)
exports.getHotelBookings = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { status } = req.query;

    let query = { hotelId };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("userId", "name email phone")
      .populate("roomId", "roomType roomNumber")
      .sort({ checkInDate: 1 });

    return res.status(200).json({
      message: "All Bookings for specific hotel fetched",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Booking Status (Hotel/Vendor)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "checked-in",
      "checked-out",
      "cancelled",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
