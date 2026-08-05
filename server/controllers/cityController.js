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
    const isDeleted = req.query.isDeleted === "true";

    const { stateId, districtId, search, sortBy, page = 1, limit } = req.query;

    let filter = { isDeleted };

    if (districtId) filter.districtId = districtId;
    if (stateId) filter.stateId = stateId;

    // Search
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Sort
    let sortObj = { createdAt: -1 };
    if (sortBy === "oldest") sortObj = { createdAt: 1 };
    if (sortBy === "name_asc") sortObj = { name: 1 };
    if (sortBy === "name_desc") sortObj = { name: -1 };

    let queryExec = City.find(filter)
      .populate("stateId", "name")
      .populate("districtId", "name")
      .sort(sortObj);

    // pagination
    if (limit) {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skipNum = (pageNum - 1) * limitNum;

      queryExec = queryExec.skip(skipNum).limit(limitNum);
    }

    // query
    const cities = await queryExec;
    const totalItems = await City.countDocuments(filter);

    const currentLimit = limit ? parseInt(limit, 10) : totalItems;
    const totalPages =
      currentLimit > 0 ? Math.ceil(totalItems / currentLimit) : 1;

    return res.status(200).json({
      data: cities,
      totalItems,
      totalPages,
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
