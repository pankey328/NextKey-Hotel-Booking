const mongoose = require("mongoose");
const State = require("../models/StateModel");

// 1. Create a new State
exports.createState = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "State name is required.",
      });
    }

    const existingState = await State.findOne({ name });

    if (existingState) {
      return res.status(409).json({
        success: false,
        message: "State already exists.",
      });
    }

    const state = await State.create({ name });

    return res.status(201).json({
      success: true,
      message: "State created successfully.",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All States 
exports.getAllStates = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";

    const states = await State.find({ isDeleted }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Single State
exports.getOneState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID.",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Soft Delete (Inactive)
exports.softDeleteState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID.",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    if (state.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "State is already inactive.",
      });
    }

    state.isDeleted = true;
    await state.save();

    return res.status(200).json({
      success: true,
      message: "State moved to inactive successfully.",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Restore State (Active)
exports.restoreState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID.",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    if (!state.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "State is already active.",
      });
    }

    state.isDeleted = false;
    await state.save();

    return res.status(200).json({
      success: true,
      message: "State restored successfully.",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Hard Delete (Permanent)
exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID.",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found.",
      });
    }

    await state.deleteOne();

    return res.status(200).json({
      success: true,
      message: "State permanently deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
