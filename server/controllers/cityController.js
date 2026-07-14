const mongoose = require("mongoose");
const City = require("../models/CityModel");
const District = require("../models/DistrictModel");
const State = require("../models/StateModel");

// 1. Create City
exports.createCity = async (req, res) => {
  try {
    const { name, districtId, stateId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "City name is required.",
      });
    }

    if (!districtId || !stateId) {
      return res.status(400).json({
        success: false,
        message: "District and State are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(districtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(stateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID.",
      });
    }

    const state = await State.findById(stateId);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    const district = await District.findOne({
      _id: districtId,
      stateId,
    });

    if (!district) {
      return res.status(400).json({
        success: false,
        message: "District does not belong to the selected state.",
      });
    }

    const existingCity = await City.findOne({
      name,
      districtId,
    });

    if (existingCity) {
      return res.status(409).json({
        success: false,
        message: "City already exists in this district.",
      });
    }

    const city = await City.create({
      name,
      districtId,
      stateId,
    });

    return res.status(201).json({
      success: true,
      message: "City created successfully.",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Cities
exports.getAllCities = async (req, res) => {
  try {
    const { stateId, districtId } = req.query;
    const isDeleted = req.query.isDeleted === "true";

    let filter = {
      isDeleted,
    };

    if (stateId) {
      if (!mongoose.Types.ObjectId.isValid(stateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid state ID.",
        });
      }

      filter.stateId = stateId;
    }

    if (districtId) {
      if (!mongoose.Types.ObjectId.isValid(districtId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid district ID.",
        });
      }

      filter.districtId = districtId;
    }

    const cities = await City.find(filter)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Single City
exports.getOneCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID.",
      });
    }

    const city = await City.findById(id)
      .populate("stateId", "name")
      .populate("districtId", "name");

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Soft Delete City
exports.softDeleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID.",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found.",
      });
    }

    if (city.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "City already inactive.",
      });
    }

    city.isDeleted = true;
    await city.save();

    return res.status(200).json({
      success: true,
      message: "City moved to inactive successfully.",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Restore City
exports.restoreCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID.",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found.",
      });
    }

    if (!city.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "City already active.",
      });
    }

    city.isDeleted = false;
    await city.save();

    return res.status(200).json({
      success: true,
      message: "City restored successfully.",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Hard Delete City
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID.",
      });
    }

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found.",
      });
    }

    await city.deleteOne();

    return res.status(200).json({
      success: true,
      message: "City permanently deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
