const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Get Hotels by serach query
router.get("/hotels", searchController.searchHotels);

// Get a Single Hotel by ID (Public)
router.get("/hotels/:id", searchController.getSingleHotel);

// Get Available Rooms for a specific Hotel (Public)
router.get("/hotels/:id/rooms", searchController.getAvailableRoomsByHotel);

module.exports = router;
