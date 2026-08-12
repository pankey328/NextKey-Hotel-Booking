const express = require("express");
const router = express.Router();

const districtController = require("../controllers/districtController");

const authMiddleware = require("../middleware/authMiddleware");

// Create
router.post("/", authMiddleware, districtController.createDistrict);

// Get All
router.get("/", districtController.getAllDistricts);

// Get One
router.get("/:id", districtController.getOneDistrict);

// Soft Delete
router.patch("/:id/soft-delete", authMiddleware, districtController.softDeleteDistrict);

// Restore
router.patch("/:id/restore", authMiddleware, districtController.restoreDistrict);

// Hard Delete
router.delete("/:id", authMiddleware, districtController.deleteDistrict);

module.exports = router;
