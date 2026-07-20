const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

router.get("/hotels", searchController.searchHotels);

router.get("/hotels/:id", searchController.getSingleHotel);
router.get("/hotels/:id/rooms", searchController.getAvailableRoomsByHotel);

module.exports = router;
