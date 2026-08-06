const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

// Download specific hotel rooms
router.get("/rooms/:hotelId", exportController.downloadHotelRooms);

// Download specific vendor hotels
router.get("/hotels/:vendorId", exportController.downloadVendorHotels);

// Download specific hotel coupons
router.get("/coupons/:hotelId", exportController.downloadHotelCoupons);

module.exports = router;
