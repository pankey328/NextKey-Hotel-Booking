const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

// 1. Create coupon
router.post("/", authMiddleware, couponController.createCoupon);

// 2. Get all coupons
router.get("/:hotelId", authMiddleware, couponController.getHotelCoupons);

// 3. Update coupon
router.put("/:id", authMiddleware, couponController.updateCoupon);

// 4. Soft Delete
router.patch(
  "/:id/soft-delete",
  authMiddleware,
  couponController.softDeleteCoupon,
);

// 5. Restore
router.patch("/:id/restore", authMiddleware, couponController.restoreCoupon);

// 6. Hard Delete
router.delete("/:id", authMiddleware, couponController.hardDeleteCoupon);

module.exports = router;
