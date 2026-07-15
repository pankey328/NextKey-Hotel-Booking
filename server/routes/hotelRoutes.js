const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.post("/register", hotelController.registerHotel); // Register new Hotel

router.get("/", hotelController.getHotels); // Get Data

router.put("/approve/:id", hotelController.approveHotel);
router.put("/reject/:id", hotelController.rejectHotel);

router.patch("/:id/soft-delete", hotelController.softDeleteHotel);
router.patch("/:id/restore", hotelController.restoreHotel);
router.delete("/:id", hotelController.hardDeleteHotel);

module.exports = router;
