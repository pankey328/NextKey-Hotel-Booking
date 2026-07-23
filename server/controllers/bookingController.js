const Booking = require("../models/BookingModel");
const TempBooking = require("../models/TempBookingModel");
const mongoose = require("mongoose");

// Creates new booking (Without Transaction)
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

    await TempBooking.deleteMany({
      userId,
      roomId: new mongoose.Types.ObjectId(roomId),
    });

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

// Creates new booking (With Transaction)
/* exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
      await session.abortTransaction(); 
      session.endSession();
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

    await newBooking.save({ session });

    await TempBooking.deleteMany(
      { 
        userId,
        roomId: new mongoose.Types.ObjectId(roomId) 
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Booking request submitted successfully",
      data: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: error.message,
    });
  }
}; */

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

//

// Create Temporary Lock (Locks specific dates for 5 minutes)
exports.createTempBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Room and dates are required" });
    }

    const existingTemp = await TempBooking.findOne({
      roomId,
      expireAt: { $gt: new Date() },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    if (existingTemp && existingTemp.userId.toString() !== userId) {
      return res.status(400).json({
        message:
          "These dates are currently booked by another user, Try again in 5 minutes",
      });
    }

    await TempBooking.deleteMany({ userId });

    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    const newTemp = await TempBooking.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      expireAt,
    });

    return res
      .status(201)
      .json({ message: "Temporary room dates locked", data: newTemp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get room availability status
exports.getRoomAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const permanentBookings = await Booking.find({
      hotelId,
      status: { $in: ["pending", "confirmed", "checked-in"] },
    }).select("roomId checkInDate checkOutDate status");

    const lockedRooms = await TempBooking.find({
      expireAt: { $gt: new Date() },
    }).select("roomId checkInDate checkOutDate status");

    return res.status(200).json({
      message: "Availability fetched successfully",
      data: [...permanentBookings, ...lockedRooms],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
