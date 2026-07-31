const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    platformFeePercentage: {
      type: Number,
      default: 10,
    },
    platformFeeAmount: {
      type: Number,
      default: 0,
    },
    hotelEarningAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked-in",
        "checked-out",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },
    isRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
