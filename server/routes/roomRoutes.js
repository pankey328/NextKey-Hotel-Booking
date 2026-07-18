const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

// 1. Get logged-in hotel's rooms
router.get("/my-rooms", authMiddleware, roomController.getMyRooms);

// 2. Get Single Room by ID (For the Edit Form)
router.get("/:id", authMiddleware, roomController.getRoomById);

// 3. Add a new room
router.post("/", authMiddleware, roomController.createRoom);

// 4. Update an existing room (details and images)
router.put("/:id", authMiddleware, roomController.updateRoom);

// 5. Quick status update (Dropdown on Dashboard)
router.patch("/:id/status", authMiddleware, roomController.updateRoomStatus);

// 6. Soft Delete (Move to Bin)
router.patch("/:id/soft-delete", authMiddleware, roomController.softDeleteRoom);

// 7. Restore from Bin
router.patch("/:id/restore", authMiddleware, roomController.restoreRoom);

// 8. Hard Delete (Permanent)
router.delete("/:id", authMiddleware, roomController.hardDeleteRoom);

module.exports = router;
