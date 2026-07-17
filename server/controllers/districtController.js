const mongoose = require("mongoose");
const District = require("../models/DistrictModel");
const State = require("../models/StateModel");

// 1. Create District
exports.createDistrict = async (req, res) => {
  try {
    let { name, stateId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "District name is required.",
      });
    }

    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(stateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid State ID.",
      });
    }

    const state = await State.findById(stateId);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    const existingDistrict = await District.findOne({
      name: name.trim().toLowerCase(),
      stateId,
    });

    if (existingDistrict) {
      return res.status(409).json({
        success: false,
        message: "District already exists in this state.",
      });
    }

    const district = await District.create({
      name,
      stateId,
    });

    return res.status(201).json({
      success: true,
      message: "District created successfully.",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Districts
exports.getAllDistricts = async (req, res) => {
  try {
    const { stateId } = req.query;
    const isDeleted = req.query.isDeleted === "true";

    let filter = {
      isDeleted,
    };

    // If stateId is provided only fetch districts of that state
    if (stateId) {
      if (!mongoose.Types.ObjectId.isValid(stateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid state ID.",
        });
      }

      filter.stateId = stateId;
    }

    const districts = await District.find(filter)
      .populate("stateId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get One District
exports.getOneDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid District ID.",
      });
    }

    const district = await District.findById(id).populate("stateId", "name");

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Soft Delete
exports.softDeleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid District ID.",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    if (district.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "District is already inactive.",
      });
    }

    district.isDeleted = true;
    await district.save();

    return res.status(200).json({
      success: true,
      message: "District moved to inactive successfully.",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Restore District
exports.restoreDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid District ID.",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    if (!district.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "District is already active.",
      });
    }

    district.isDeleted = false;
    await district.save();

    return res.status(200).json({
      success: true,
      message: "District restored successfully.",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Hard Delete
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid District ID.",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    await district.deleteOne();

    return res.status(200).json({
      success: true,
      message: "District permanently deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
