const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    roomName: {
      type: String,
    },
    roomType: {
      type: String,
      required: true,
      default: "Standard",
    },
    floorNumber: {
      type: String,
    },
    description: {
      type: String,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },
    weekendPrice: {
      type: Number,
    },
    holidayPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxIncluded: {
      type: Boolean,
      default: false,
    },

    maxAdults: {
      type: Number,
      default: 2,
    },
    maxChildren: {
      type: Number,
      default: 0,
    },
    totalGuests: {
      type: Number,
      default: 2,
    },
    numberOfBeds: {
      type: Number,
      default: 1,
    },
    bedType: {
      type: String,
      default: "Double Bed",
    },

    facilities: [{ type: String }],

    status: {
      type: String,
      enum: [
        "Available",
        "Occupied",
        "Reserved",
        "Under Maintenance",
        "Out of Service",
      ],
      default: "Available",
    },
    cancellationPolicy: {
      type: String,
      default: "Free Cancellation",
    },

    images: [{ type: String }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Room", roomSchema);
