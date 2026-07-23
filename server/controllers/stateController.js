const State = require("../models/StateModel");

// Create a new State
exports.createState = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "State name is required",
      });
    }

    const existingState = await State.findOne({ name });

    if (existingState) {
      return res.status(400).json({
        message: "State already exists",
      });
    }

    const state = await State.create({ name });

    return res.status(201).json({
      message: "State created successfully",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get All States
exports.getAllStates = async (req, res) => {
  try {
    const isDeleted = req.query.isDeleted === "true";

    const states = await State.find({ isDeleted }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single State
exports.getOneState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "State ID is required",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    return res.status(200).json({
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Soft Delete (Inactive)
exports.softDeleteState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "State ID is required",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        message: "State not found",
      });
    }

    if (state.isDeleted) {
      return res.status(400).json({
        message: "State is already inactive",
      });
    }

    state.isDeleted = true;
    await state.save();

    return res.status(200).json({
      message: "State inactived successfully (soft deleted)",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Restore State (Active)
exports.restoreState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "State ID is required",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        message: "State not found.",
      });
    }

    if (!state.isDeleted) {
      return res.status(400).json({
        message: "State is already active",
      });
    }

    state.isDeleted = false;
    await state.save();

    return res.status(200).json({
      message: "State restored successfully",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Hard Delete
exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "State ID is required",
      });
    }

    const state = await State.findById(id);

    if (!state) {
      return res.status(404).json({
        message: "State not found.",
      });
    }

    await state.deleteOne();

    return res.status(200).json({
      message: "State permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
