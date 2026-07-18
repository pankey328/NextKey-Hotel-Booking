const Room = require("../models/RoomModel");
const Hotel = require("../models/HotelModel");
const { uploadImage } = require("../utils/cloudinary");
const { default: mongoose } = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// 1. Add New Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, pricePerNight } = req.body;

    if (!roomNumber || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Room Number and Price Per Night are required.",
      });
    }

    const hotel = await Hotel.findOne({ email: req.user.email });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel profile not found for this user.",
      });
    }

    let parsedFacilities = [];
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid format for facilities. Must be a valid JSON array.",
        });
      }
    }

    let imageUrls = [];
    if (req.files) {
      const uploadData = await uploadImage(req.files);

      if (uploadData && Array.isArray(uploadData)) {
        imageUrls = uploadData.map((data) => data.secure_url);
      }
    }

    const newRoom = await Room.create({
      ...req.body,
      hotelId: hotel._id,
      facilities: parsedFacilities,
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    console.error("Error in createRoom:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get Rooms for the Logged-in Hotel
exports.getMyRooms = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";

    const hotel = await Hotel.findOne({ email: req.user.email });
    if (!hotel)
      return res.status(404).json({ message: "Hotel profile not found." });

    const rooms = await Room.find({
      hotelId: hotel._id,
      isDeleted,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      hotelInfo: hotel,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Room ID format.",
      });
    }

    const allowedStatuses = [
      "Available",
      "Occupied",
      "Reserved",
      "Under Maintenance",
      "Out of Service",
    ];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status value.",
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room status updated successfully.",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Update Room Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Soft Delete (Move to Bin)
exports.softDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Room ID." });

    const room = await Room.findByIdAndUpdate(id, { isDeleted: true });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });

    res.status(200).json({ success: true, message: "Room moved to bin." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Restore Room
exports.restoreRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Room ID." });

    const room = await Room.findByIdAndUpdate(id, { isDeleted: false });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });

    res.status(200).json({ success: true, message: "Room restored." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Hard Delete (Permanent)
exports.hardDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Room ID format.",
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Room permanently deleted.",
    });
  } catch (error) {
    console.error("Hard Delete Room Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 7. Get Single Room by ID (Edit Form)
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Room ID format." });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Update Room
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Room ID format." });
    }

    const hotel = await Hotel.findOne({ email: req.user.email });
    const room = await Room.findById(id);

    if (!room || room.hotelId.toString() !== hotel._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to edit this room." });
    }

    let parsedFacilities = room.facilities;
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid facilities format." });
      }
    }

    let finalImages = [];

    if (req.body.existingImages) {
      try {
        finalImages = JSON.parse(req.body.existingImages);
      } catch (err) {
        finalImages = room.images; 
      }
    }

    if (req.files) {
      const uploadData = await uploadImage(req.files);
      if (uploadData && Array.isArray(uploadData)) {
        const newUrls = uploadData.map((data) => data.secure_url);
        finalImages = [...finalImages, ...newUrls]; // Merge old and new images
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        ...req.body,
        facilities: parsedFacilities,
        images: finalImages,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Update Room Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
