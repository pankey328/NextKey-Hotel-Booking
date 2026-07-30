const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// Create new booking
router.post("/create", authMiddleware, bookingController.createBooking);

// Get User's own bookings
router.get("/my-bookings", authMiddleware, bookingController.getUserBookings);

// Get booking of a hotel
router.get(
  "/hotel/:hotelId",
  authMiddleware,
  bookingController.getHotelBookings,
);

// Update status of room booking
router.put(
  "/:id/status",
  authMiddleware,
  bookingController.updateBookingStatus,
);

// Temporary lock a room for a user
router.post("/temp-lock", authMiddleware, bookingController.createTempBooking);

// Get all room availability for a hotel
router.get("/availability/:hotelId", bookingController.getRoomAvailability);

// Create review for a booking
router.post(
  "/:bookingId/review",
  authMiddleware,
  bookingController.submitBookingReview,
);

// Get Hotel Dashboard Stats (Hotel Dashboard)
router.get(
  "/hotel-stats/:hotelId",
  authMiddleware,
  bookingController.getDashboardStats,
);

// Get Vendor Dashboard Stats (Vendor Dashboard)
router.get(
  "/vendor-stats",
  authMiddleware,
  bookingController.getVendorDashboardStats,
);

module.exports = router;
