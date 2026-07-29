const Booking = require("../models/BookingModel");
const TempBooking = require("../models/TempBookingModel");
const Review = require("../models/ReviewModel");
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

// Submit a Review (User)
exports.submitBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ratings, comment } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "checked-out") {
      return res
        .status(400)
        .json({ message: "You can only review after checking out" });
    }
    if (booking.isRated) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this stay" });
    }

    const newReview = await Review.create({
      bookingId,
      userId,
      hotelId: booking.hotelId,
      roomId: booking.roomId,
      ratings,
      comment,
    });

    booking.isRated = true;
    await booking.save();

    return res.status(201).json({
      message: "feedback submitted!",
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Hotel Dashboard DATA (Hotel/Vendor)
exports.getDashboardStats = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [newBookingsCount, checkInsToday, checkOutsToday, recentBookings] =
      await Promise.all([
        Booking.countDocuments({
          hotelId,
          status: "pending",
        }),

        Booking.countDocuments({
          hotelId,
          checkInDate: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
          status: {
            $in: ["pending", "confirmed", "checked-in"],
          },
        }),

        Booking.countDocuments({
          hotelId,
          checkOutDate: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
          status: {
            $in: ["confirmed", "checked-in", "checked-out"],
          },
        }),

        Booking.find({ hotelId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("userId", "name")
          .populate("roomId", "roomType"),
      ]);

    const completedBookings = await Booking.find({
      hotelId,
      status: {
        $in: ["confirmed", "checked-in", "checked-out"],
      },
    });

    let totalRevenue = 0;

    for (const booking of completedBookings) {
      totalRevenue += booking.finalPrice;
    }

    const reviews = await Review.find({ hotelId });

    let totalRoom = 0;
    let totalCleaning = 0;
    let totalService = 0;

    for (const review of reviews) {
      totalRoom += review.ratings.room;
      totalCleaning += review.ratings.cleaning;
      totalService += review.ratings.service;
    }

    const totalReviews = reviews.length;

    let avgRoom = 0;
    let avgCleaning = 0;
    let avgService = 0;
    let overallRating = 0;

    if (totalReviews > 0) {
      avgRoom = totalRoom / totalReviews;
      avgCleaning = totalCleaning / totalReviews;
      avgService = totalService / totalReviews;

      overallRating = (avgRoom + avgCleaning + avgService) / 3;
    }

    res.status(200).json({
      message: "Dashboard DATA Fetched Successfully",
      data: {
        newBookingsCount,
        checkInsToday,
        checkOutsToday,
        totalRevenue,
        recentBookings,
        ratings: {
          overall: overallRating.toFixed(1),
          room: avgRoom.toFixed(1),
          cleaning: avgCleaning.toFixed(1),
          service: avgService.toFixed(1),
          totalReviews,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
