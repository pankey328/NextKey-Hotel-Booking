const mongoose = require("mongoose");
const District = require("../models/DistrictModel");
const State = require("../models/StateModel");

// Create District
exports.createDistrict = async (req, res) => {
  try {
    let { name, stateId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "District name is required",
      });
    }

    if (!stateId) {
      return res.status(400).json({
        message: "State is required",
      });
    }

    const state = await State.findById(stateId);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    const existingDistrict = await District.findOne({
      name: name.trim().toLowerCase(),
      stateId,
    });

    if (existingDistrict) {
      return res.status(400).json({
        message: "District already exists in this state",
      });
    }

    const district = await District.create({
      name,
      stateId,
    });

    return res.status(201).json({
      message: "District created successfully",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Districts
exports.getAllDistricts = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";

    const { stateId, search, sortBy, page = 1, limit } = req.query;

    let filter = {
      isDeleted,
    };

    if (stateId) {
      filter.stateId = stateId;
    }

    // Search
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Sort
    let sortObj = { createdAt: -1 };
    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "name_asc") sortObj = { name: 1 }; // A to Z
    if (sortBy === "name_desc") sortObj = { name: -1 }; // Z to A

    // query
    let queryExec = District.find(filter)
      .populate("stateId", "name")
      .sort(sortObj);

    // pagination
    if (limit) {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skipNum = (pageNum - 1) * limitNum;

      queryExec = queryExec.skip(skipNum).limit(limitNum);
    }

    const districts = await queryExec;
    const totalItems = await District.countDocuments(filter);

    const currentLimit = limit ? parseInt(limit, 10) : totalItems;
    const totalPages =
      currentLimit > 0 ? Math.ceil(totalItems / currentLimit) : 1;

    return res.status(200).json({
      data: districts,
      totalItems,
      totalPages,
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get One District
exports.getOneDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "District ID is required",
      });
    }

    const district = await District.findById(id).populate("stateId", "name");

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    return res.status(200).json({
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Soft Delete
exports.softDeleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "District ID is required",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    if (district.isDeleted) {
      return res.status(400).json({
        message: "District is already inactive",
      });
    }

    district.isDeleted = true;
    await district.save();

    return res.status(200).json({
      message: "District moved to inactive successfully",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Restore District
exports.restoreDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "District ID is required",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    if (!district.isDeleted) {
      return res.status(400).json({
        message: "District is already active",
      });
    }

    district.isDeleted = false;
    await district.save();

    return res.status(200).json({
      message: "District restored successfully",
      data: district,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Hard Delete
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "District ID is required",
      });
    }

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        message: "District not found.",
      });
    }

    await district.deleteOne();

    return res.status(200).json({
      message: "District permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
