const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all rooms
router.get("/my-rooms", authMiddleware, roomController.getMyRooms);

// Get Single Room
router.get("/:id", authMiddleware, roomController.getRoomById);

// Add new room
router.post("/", authMiddleware, roomController.createRoom);

// Update an exist room
router.put("/:id", authMiddleware, roomController.updateRoom);

// status update
router.patch("/:id/status", authMiddleware, roomController.updateRoomStatus);

// Soft Delete
router.patch("/:id/soft-delete", authMiddleware, roomController.softDeleteRoom);

// Restore
router.patch("/:id/restore", authMiddleware, roomController.restoreRoom);

// Hard Delete
router.delete("/:id", authMiddleware, roomController.hardDeleteRoom);

module.exports = router;
