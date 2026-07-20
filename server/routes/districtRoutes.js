const express = require("express");
const router = express.Router();

const districtController = require("../controllers/districtController");

// Create
router.post("/", districtController.createDistrict);

// Get All
router.get("/", districtController.getAllDistricts);

// Get One
router.get("/:id", districtController.getOneDistrict);

// Soft Delete
router.patch("/:id/soft-delete", districtController.softDeleteDistrict);

// Restore
router.patch("/:id/restore", districtController.restoreDistrict);

// Hard Delete
router.delete("/:id", districtController.deleteDistrict);

module.exports = router;
