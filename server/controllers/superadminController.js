const mongoose = require("mongoose");
const Hotel = require("../models/HotelModel");
const Room = require("../models/RoomModel");
const User = require("../models/userModel");
const VendorRequest = require("../models/VendorRequestModel");
const Booking = require("../models/BookingModel");

exports.getSuperAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalVendors,
      totalHotels,
      totalRooms,
      uniqueLocations,
      totalRevenueData,
    ] = await Promise.all([
      VendorRequest.countDocuments({ status: "approved" }),

      Hotel.countDocuments({ status: "approved", isDeleted: false }),

      Room.countDocuments({ isDeleted: false }),

      Hotel.distinct("cityId", { status: "approved", isDeleted: false }),

      Booking.aggregate([
        { $match: { status: { $in: ["checked-out", "completed"] } } },
        {
          $group: {
            _id: null,
            totalGrossRevenue: { $sum: "$finalPrice" },
            totalPlatformRevenue: { $sum: "$platformFeeAmount" },
          },
        },
      ]),
    ]);

    const hotelRevenue = await Booking.aggregate([
      { $match: { status: { $in: ["checked-out", "completed"] } } },
      {
        $group: {
          _id: "$hotelId",
          totalBookings: { $sum: 1 },
          grossRevenue: { $sum: "$finalPrice" },
          platformFee: { $sum: "$platformFeeAmount" },
          hotelEarning: { $sum: "$hotelEarningAmount" },
        },
      },
      // join with "hotels" table
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      { $unwind: "$hotelDetails" },
      {
        $project: {
          hotelName: "$hotelDetails.name",
          totalBookings: 1,
          grossRevenue: 1,
          platformFee: 1,
          hotelEarning: 1,
        },
      },
    ]);

    const vendorRevenue = await Booking.aggregate([
      { $match: { status: { $in: ["checked-out", "completed"] } } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      { $unwind: "$hotelDetails" },
      // group by vendor id
      {
        $group: {
          _id: "$hotelDetails.vendorId",
          totalBookings: { $sum: 1 },
          grossRevenue: { $sum: "$finalPrice" },
          platformFee: { $sum: "$platformFeeAmount" },
          vendorEarning: { $sum: "$hotelEarningAmount" },
        },
      },
      // join with "vendorrequests" table
      {
        $lookup: {
          from: "vendorrequests",
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: "$vendorDetails" },
      {
        $project: {
          vendorName: "$vendorDetails.companyName",
          contactEmail: "$vendorDetails.email",
          totalBookings: 1,
          grossRevenue: 1,
          platformFee: 1,
          vendorEarning: 1,
        },
      },
      { $sort: { platformFee: -1 } },
    ]);

    const globalStats =
      totalRevenueData.length > 0
        ? totalRevenueData[0]
        : { totalGrossRevenue: 0, totalPlatformRevenue: 0 };

    res.status(200).json({
      data: {
        stats: {
          totalVendors,
          totalHotels,
          totalRooms,
          totalLocations: uniqueLocations.length,
          totalGrossRevenue: globalStats.totalGrossRevenue,
          totalPlatformRevenue: globalStats.totalPlatformRevenue,
        },
        hotelRevenue,
        vendorRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
