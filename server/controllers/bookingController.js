const Booking = require("../models/BookingModel");
const TempBooking = require("../models/TempBookingModel");
const Review = require("../models/ReviewModel");
const VendorRequest = require("../models/VendorRequestModel");
const Hotel = require("../models/HotelModel");
const mongoose = require("mongoose");

// Creates new booking (With Transaction)
exports.createBooking = async (req, res) => {
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
      guestName,
      guestEmail,
      guestPhone,
      adults,
      children,
      specialRequests,
    } = req.body;

    const userId = req.user.id;

    if (!hotelId || !roomId || !checkInDate || !checkOutDate || !totalDays) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Missing required booking details" });
    }

    const platformFeePercentage = 10;
    const platformFeeAmount = (finalPrice * platformFeePercentage) / 100;
    const hotelEarningAmount = finalPrice - platformFeeAmount;

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
      guestName,
      guestEmail,
      guestPhone,
      adults,
      children,
      specialRequests,
      platformFeePercentage,
      platformFeeAmount,
      hotelEarningAmount,
      status: "pending",
    });

    await newBooking.save({ session });

    await TempBooking.deleteMany(
      {
        userId,
        roomId: new mongoose.Types.ObjectId(roomId),
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
    const {
      search,
      sortBy,
      filterView,
      page = 1,
      limit = 5,
      startDate,
      endDate,
    } = req.query;

    let query = { hotelId };

    // Tabs filter
    if (filterView === "pending") query.status = "pending";
    if (filterView === "checked_in") query.status = "checked-in";
    if (filterView === "arriving") {
      query.status = "confirmed";
      // Check-In's for today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.checkInDate = { $gte: todayStart, $lte: todayEnd };
    }

    // Date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let bookings = await Booking.find(query)
      .populate("userId", "name email phone")
      .populate("roomId", "roomType roomNumber");

    // Searching
    if (search) {
      const searchTerm = search.toLowerCase();
      bookings = bookings.filter((booking) => {
        const matchesName = String(booking.userId?.name || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchesEmail = String(booking.userId?.email || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchesRoom = String(booking.roomId?.roomType || "")
          .toLowerCase()
          .includes(searchTerm);
        return matchesName || matchesEmail || matchesRoom;
      });
    }

    // Sorting
    if (sortBy) {
      bookings.sort((a, b) => {
        if (sortBy === "price_desc")
          return (b.finalPrice || 0) - (a.finalPrice || 0);
        if (sortBy === "price_asc")
          return (a.finalPrice || 0) - (b.finalPrice || 0);
        if (sortBy === "name_asc")
          return String(a.userId?.name || "").localeCompare(
            String(b.userId?.name || ""),
          );
        if (sortBy === "name_desc")
          return String(b.userId?.name || "").localeCompare(
            String(a.userId?.name || ""),
          );
        if (sortBy === "oldest")
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortBy === "newest")
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
      });
    } else {
      bookings.sort(
        (a, b) => new Date(a.checkInDate || 0) - new Date(b.checkInDate || 0),
      );
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const totalItems = bookings.length;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    const pendingCount = await Booking.countDocuments({
      hotelId,
      status: "pending",
    });

    return res.status(200).json({
      message: "Bookings fetched",
      data: paginatedBookings,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
      currentPage: pageNum,
      pendingCount,
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

// Get Hotel Dashboard DATA (Hotel)
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
    let netRevenue = 0; // 90% after platform fees

    for (const booking of completedBookings) {
      totalRevenue += booking.finalPrice || 0;
      netRevenue += booking.hotelEarningAmount || 0;
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
        netRevenue,
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

// Get Vendor Dashboard DATA (Vendor)
exports.getVendorDashboardStats = async (req, res) => {
  try {
    const vendorCompany = await VendorRequest.findOne({
      email: req.user.email,
    });
    if (!vendorCompany) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const hotels = await Hotel.find({
      vendorId: vendorCompany._id,
      isDeleted: false,
      status: "approved",
    });
    const hotelIds = hotels.map((h) => h._id);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      newBookingsCount,
      checkInsToday,
      checkOutsToday,
      completedBookings,
      recentBookings,
      reviews,
    ] = await Promise.all([
      Booking.countDocuments({ hotelId: { $in: hotelIds }, status: "pending" }),

      Booking.countDocuments({
        hotelId: { $in: hotelIds },
        checkInDate: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ["pending", "confirmed", "checked-in"] },
      }),

      Booking.countDocuments({
        hotelId: { $in: hotelIds },
        checkOutDate: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ["confirmed", "checked-in", "checked-out"] },
      }),

      Booking.find({
        hotelId: { $in: hotelIds },
        status: { $in: ["confirmed", "checked-in", "checked-out"] },
      }).select("finalPrice hotelEarningAmount"),

      Booking.find({ hotelId: { $in: hotelIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name")
        .populate("roomId", "roomType")
        .populate("hotelId", "name"),

      Review.find({ hotelId: { $in: hotelIds } }),
    ]);

    let totalRevenue = 0;
    let netRevenue = 0; // 90%

    for (const booking of completedBookings) {
      totalRevenue += booking.finalPrice || 0;
      netRevenue += booking.hotelEarningAmount || 0;
    }

    let totalRoom = 0,
      totalCleaning = 0,
      totalService = 0;
    for (const review of reviews) {
      totalRoom += review.ratings.room;
      totalCleaning += review.ratings.cleaning;
      totalService += review.ratings.service;
    }

    const totalReviews = reviews.length;
    let avgRoom = 0,
      avgCleaning = 0,
      avgService = 0,
      overallRating = 0;

    if (totalReviews > 0) {
      avgRoom = totalRoom / totalReviews;
      avgCleaning = totalCleaning / totalReviews;
      avgService = totalService / totalReviews;
      overallRating = (avgRoom + avgCleaning + avgService) / 3;
    }

    res.status(200).json({
      message: "Vendor Master Dashboard DATA Fetched Successfully",
      data: {
        totalProperties: hotels.length,
        newBookingsCount,
        checkInsToday,
        checkOutsToday,
        totalRevenue,
        netRevenue,
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
    res.status(500).json({ message: error.message });
  }
};
