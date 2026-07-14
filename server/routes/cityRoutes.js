const express = require("express");
const router = express.Router();

const cityController = require("../controllers/cityController");

// 1. Create City
router.post("/", cityController.createCity);

// 2. Get All Cities
router.get("/", cityController.getAllCities);

// 3. Get Single City
router.get("/:id", cityController.getOneCity);

// 4. Soft Delete City
router.patch("/:id/soft-delete", cityController.softDeleteCity);

// 5. Restore City
router.patch("/:id/restore", cityController.restoreCity);

// 6. Permanent Delete City
router.delete("/:id", cityController.deleteCity);

module.exports = router;
