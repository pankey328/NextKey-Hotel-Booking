const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadminController");
const authMiddleware = require("../middleware/authMiddleware");

// Get SuperAdmin Dashboard Stats
router.get(
  "/dashboard-stats",
  authMiddleware,
  superadminController.getSuperAdminDashboardStats,
);

module.exports = router;
