const express = require("express");
const router = express.Router();

const cityController = require("../controllers/cityController");

const authMiddleware = require("../middleware/authMiddleware");

// Create
router.post("/", authMiddleware, cityController.createCity);

// Get All
router.get("/", cityController.getAllCities);

// Get One
router.get("/:id", cityController.getOneCity);

// Soft Delete
router.patch("/:id/soft-delete", authMiddleware, cityController.softDeleteCity);

// Restore
router.patch("/:id/restore", authMiddleware, cityController.restoreCity);

// Hard Delete
router.delete("/:id", authMiddleware, cityController.deleteCity);

module.exports = router;
