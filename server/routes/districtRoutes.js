const express = require("express");
const router = express.Router();

const districtController = require("../controllers/districtController");

// 1. Create District
router.post("/", districtController.createDistrict);

// 2. Get All Districts
router.get("/", districtController.getAllDistricts);

// 3. Get Single District
router.get("/:id", districtController.getOneDistrict);

// 4. Soft Delete District
router.patch("/:id/soft-delete", districtController.softDeleteDistrict);

// 5. Restore District
router.patch("/:id/restore", districtController.restoreDistrict);

// 6. Permanent Delete District
router.delete("/:id", districtController.deleteDistrict);

module.exports = router;
