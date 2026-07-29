const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  ratings: {
    room: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    cleaning: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    service: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
