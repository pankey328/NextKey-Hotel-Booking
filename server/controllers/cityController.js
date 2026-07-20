const City = require("../models/CityModel");
const District = require("../models/DistrictModel");
const State = require("../models/StateModel");

// Create City
exports.createCity = async (req, res) => {
  try {
    const { name, districtId, stateId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "City name is required",
      });
    }

    if (!districtId || !stateId) {
      return res.status(400).json({
        message: "District and State are required",
      });
    }

    const state = await State.findById(stateId);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    const district = await District.findOne({
      _id: districtId,
      stateId,
    });

    if (!district) {
      return res.status(400).json({
        message: "District not belong to the selected state",
      });
    }

    const existingCity = await City.findOne({
      name: name.trim().toLowerCase(),
      districtId,
    });

    if (existingCity) {
      return res.status(400).json({
        message: "City already exists in this district",
      });
    }

    const city = await City.create({
      name,
      districtId,
      stateId,
    });

    return res.status(201).json({
      message: "City created successfully",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Cities
exports.getAllCities = async (req, res) => {
  try {
    const { stateId, districtId } = req.query;
    const isDeleted = req.query.isDeleted === "true";

    let filter = {
      isDeleted,
    };

    if (districtId) {
      filter.districtId = districtId;
    }

    if (stateId) {
      filter.stateId = stateId;
    }

    const cities = await City.find(filter)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      data: cities,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single City
exports.getOneCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "City ID is required",
      });
    }

    const city = await City.findById(id)
      .populate("stateId", "name")
      .populate("districtId", "name");

    if (!city) {
      return res.status(404).json({
        message: "City not found",
      });
    }

    return res.status(200).json({
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Soft Delete City
exports.softDeleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "City ID is required",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        message: "City not found",
      });
    }

    if (city.isDeleted) {
      return res.status(400).json({
        message: "City already inactive",
      });
    }

    city.isDeleted = true;
    await city.save();

    return res.status(200).json({
      message: "City moved to inactive successfully",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Restore City
exports.restoreCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "City ID is required",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        message: "City not found",
      });
    }

    if (!city.isDeleted) {
      return res.status(400).json({
        message: "City already active",
      });
    }

    city.isDeleted = false;
    await city.save();

    return res.status(200).json({
      message: "City restored successfully",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Hard Delete City
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "City ID is required",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        message: "City not found",
      });
    }

    await city.deleteOne();

    return res.status(200).json({
      message: "City permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
