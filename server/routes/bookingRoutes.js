const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, bookingController.createBooking);

module.exports = router;
