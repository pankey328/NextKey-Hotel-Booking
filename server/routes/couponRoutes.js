const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

// Create
router.post("/", authMiddleware, couponController.createCoupon);

// Get all
router.get("/:hotelId", authMiddleware, couponController.getHotelCoupons);

// Update
router.put("/:id", authMiddleware, couponController.updateCoupon);

// Soft Delete
router.patch(
  "/:id/soft-delete",
  authMiddleware,
  couponController.softDeleteCoupon,
);

// Restore
router.patch("/:id/restore", authMiddleware, couponController.restoreCoupon);

// Hard Delete
router.delete("/:id", authMiddleware, couponController.hardDeleteCoupon);

module.exports = router;
