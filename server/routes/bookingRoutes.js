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
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus)

module.exports = router;
