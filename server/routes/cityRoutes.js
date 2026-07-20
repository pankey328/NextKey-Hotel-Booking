const express = require("express");
const router = express.Router();

const cityController = require("../controllers/cityController");

// Create
router.post("/", cityController.createCity);

// Get All
router.get("/", cityController.getAllCities);

// Get One
router.get("/:id", cityController.getOneCity);

// Soft Delete
router.patch("/:id/soft-delete", cityController.softDeleteCity);

// Restore
router.patch("/:id/restore", cityController.restoreCity);

// Hard Delete
router.delete("/:id", cityController.deleteCity);

module.exports = router;
