const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authentication = require("../middleware/authMiddleware");

// SIGN-UP
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);

// LOGIN
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);

// RESET
router.post("/reset", authentication, userController.reset);

// FORGET
router.post("/forget-password", userController.forget);
router.post("/verify-forget", userController.verifyForget);

module.exports = router;
