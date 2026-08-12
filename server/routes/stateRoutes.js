const express = require("express");
const router = express.Router();

const stateController = require("../controllers/stateController");

const authMiddleware = require("../middleware/authMiddleware");

// Create
router.post("/", authMiddleware, stateController.createState);

// Get All
router.get("/", stateController.getAllStates);

// Get One
router.get("/:id", stateController.getOneState);

// Soft Delete
router.patch("/:id/soft-delete", authMiddleware, stateController.softDeleteState);

// Restore
router.patch("/:id/restore", authMiddleware, stateController.restoreState);

// Hard Delete
router.delete("/:id", authMiddleware, stateController.deleteState);

module.exports = router;
