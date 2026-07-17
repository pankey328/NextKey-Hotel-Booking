const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const authMiddleware = require('../middleware/authMiddleware')

router.post("/register", vendorController.registerVendor);
router.post(
  "/superadmin/add",
  authMiddleware,
  vendorController.superAdminAddVendor,
);
router.get("/status/:id", vendorController.checkVendorStatus);
router.put("/update/:id", vendorController.updateVendorRequest);

// Admin Routes
router.get("/", vendorController.getVendorRequests);

router.put("/approve/:id", vendorController.approveVendor);
router.put("/reject/:id", vendorController.rejectVendor);

router.patch("/:id/soft-delete", vendorController.softDeleteVendor);
router.patch("/:id/restore", vendorController.restoreVendor);

router.delete("/:id", vendorController.hardDeleteVendor);

module.exports = router;
