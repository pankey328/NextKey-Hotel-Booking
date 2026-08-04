const Room = require("../models/RoomModel");
const Hotel = require("../models/HotelModel");
const { uploadImage } = require("../utils/cloudinary");

// Add New Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, pricePerNight } = req.body;

    if (!roomNumber || !pricePerNight) {
      return res.status(400).json({
        message: "Room Number and Price Per Night are required",
      });
    }

    const hotel = await Hotel.findOne({ email: req.user.email });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel profile not found for this user",
      });
    }

    let parsedFacilities = [];
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid format for facilities",
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

    return res.status(201).json({
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get Rooms for Hotel
exports.getMyRooms = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";
    const { search, sortBy } = req.query;

    const hotel = await Hotel.findOne({ email: req.user.email });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel profile not found" });
    }

    let query = {
      hotelId: hotel._id,
      isDeleted,
    };

    if (search) {
      query.$or = [
        { roomType: { $regex: search, $options: "i" } },
        { roomName: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = { createdAt: -1 }; // BY DEFAULT ON NEWEST

    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "price_desc") sortObj = { pricePerNight: -1 }; // High to Low
    if (sortBy === "price_asc") sortObj = { pricePerNight: 1 }; // Low to High

    const rooms = await Room.find(query).sort(sortObj);

    return res.status(200).json({
      hotelInfo: hotel,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Room Status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Invalid or missing status value",
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedRoom) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.status(200).json({
      message: "Room status updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Soft Delete (Move to Bin)
exports.softDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findByIdAndUpdate(id, { isDeleted: true });

    if (!room) return res.status(404).json({ message: "Room not found" });

    return res.status(200).json({ message: "Room moved to bin" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Restore Room
exports.restoreRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findByIdAndUpdate(id, { isDeleted: false });
    if (!room) return res.status(404).json({ message: "Room not found" });

    return res.status(200).json({ message: "Room restored" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Hard Delete
exports.hardDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Room permanently deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Room by ID (Edit Form)
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json({ message: "Room Data fetched", data: room });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const hotel = await Hotel.findOne({ email: req.user.email });
    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }
    const room = await Room.findById(id);

    if (!room || room.hotelId.toString() !== hotel._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this room." });
    }

    let parsedFacilities = room.facilities;
    if (req.body.facilities) {
      try {
        parsedFacilities = JSON.parse(req.body.facilities);
      } catch (err) {
        return res.status(400).json({ message: "Invalid facilities format" });
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
        finalImages = [...finalImages, ...newUrls];
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

    return res.status(200).json({
      message: "Room updated successfully.",
      data: updatedRoom,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
