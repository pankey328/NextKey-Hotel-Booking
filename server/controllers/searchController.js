const Hotel = require("../models/HotelModel");
const Room = require("../models/RoomModel");

// Get Hotels by serach query
exports.searchHotels = async (req, res) => {
  try {
    const {
      search,
      stateId,
      districtId,
      cityId,
      starRating,
      hotelType,
      features,
    } = req.query;

    let query = {
      status: "approved",
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (stateId) query.stateId = stateId;
    if (districtId) query.districtId = districtId;
    if (cityId) query.cityId = cityId;
    if (starRating) query.starRating = Number(starRating);
    if (hotelType) query.hotelType = hotelType;

    if (features) {
      const featuresArray = features.split(",");
      query.features = { $all: featuresArray };
    }

    const hotels = await Hotel.find(query)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get a Single Hotel by ID (Public)
exports.getSingleHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Hotel ID is required",
      });
    }

    const hotel = await Hotel.findById(id)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name");

    if (!hotel || hotel.status !== "approved" || hotel.isDeleted) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      message: "Hotel fetched successfully",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get Available Rooms for a specific Hotel (Public)
exports.getAvailableRoomsByHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      search,
      minPrice,
      maxPrice,
      bedType,
      status,
      cancellationPolicy,
      minDiscount,
      features,
    } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Hotel ID is required" });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel || hotel.isDeleted || hotel.status !== "approved") {
      return res.status(404).json({ message: "Hotel not found" });
    }

    let query = {
      hotelId: id,
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { roomType: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (bedType) query.bedType = bedType;
    if (status) query.status = status;
    if (cancellationPolicy) query.cancellationPolicy = cancellationPolicy;

    if (minDiscount) query.discount = { $gte: Number(minDiscount) };

    if (features) {
      const featuresArray = features.split(",");
      query.facilities = { $all: featuresArray };
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
