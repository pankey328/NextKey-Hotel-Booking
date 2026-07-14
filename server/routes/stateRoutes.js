const express = require("express");
const router = express.Router();

const stateController = require("../controllers/stateController");

// Create
router.post("/", stateController.createState);

// Get All
router.get("/", stateController.getAllStates);

// Get One
router.get("/:id", stateController.getOneState);

// Soft Delete
router.patch("/:id/soft-delete", stateController.softDeleteState);

// Restore
router.patch("/:id/restore", stateController.restoreState);

// Hard Delete
router.delete("/:id", stateController.deleteState);

module.exports = router;
