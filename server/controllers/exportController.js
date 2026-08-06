const xlsx = require("xlsx");
const Room = require("../models/RoomModel");
const Hotel = require("../models/HotelModel");
const Coupon = require("../models/CouponModel");

// Download hotel rooms
exports.downloadHotelRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const rooms = await Room.find({
      hotelId,
      isDeleted: false,
    }).sort({
      roomNumber: 1,
    });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        message: "No rooms found to export",
      });
    }

    const tableData = rooms.map((room) => ({
      "Room No.": room.roomNumber,
      "Room Name": room.roomName || "N/A",
      "Room Type": room.roomType,
      Floor: room.floorNumber || "N/A",
      "Price / Night (₹)": room.pricePerNight,
      "Weekend Price (₹)": room.weekendPrice || 0,
      "Holiday Price (₹)": room.holidayPrice || 0,
      "Discount (%)": room.discount || 0,
      "Tax Included": room.taxIncluded ? "Yes" : "No",
      "Max Adults": room.maxAdults,
      "Max Children": room.maxChildren,
      "Total Capacity": room.totalGuests,
      "No. of Beds": room.numberOfBeds,
      "Bed Type": room.bedType,
      Facilities: room.facilities ? room.facilities.join(", ") : "",
      Status: room.status,
      "Cancellation Policy": room.cancellationPolicy,
      Description: room.description || "N/A",
    }));

    const sheet = xlsx.utils.json_to_sheet(tableData);

    const colWidths = Object.keys(tableData[0]).map((key) => ({
      wch: Math.max(key.length, 15),
    }));

    sheet["!cols"] = colWidths;

    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, sheet, "Rooms List");

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Hotel_Rooms_List.xlsx"',
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Download vendor hotels
exports.downloadVendorHotels = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const hotels = await Hotel.find({ vendorId, isDeleted: false })
      .populate("stateId", "name")
      .populate("districtId", "name")
      .populate("cityId", "name")
      .sort({ createdAt: -1 });

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ message: "No hotels found to export" });
    }

    // Format data in table columns
    const tableData = hotels.map((hotel) => ({
      "Tracking ID": hotel.trackingId,
      "Hotel Name": hotel.name,
      "Hotel Type": hotel.hotelType,
      "Star Rating": `${hotel.starRating} Star`,
      Email: hotel.email,
      Phone: hotel.phone,
      Address: hotel.address,
      City: hotel.cityId?.name || "N/A",
      District: hotel.districtId?.name || "N/A",
      State: hotel.stateId?.name || "N/A",
      Features: hotel.features ? hotel.features.join(", ") : "",
      Status: hotel.status.toUpperCase(),
      "Reject Remark": hotel.rejectRemark || "None",
      "Registered On": new Date(hotel.createdAt).toLocaleDateString(),
    }));

    const sheet = xlsx.utils.json_to_sheet(tableData);

    const colWidths = Object.keys(tableData[0]).map((key) => ({
      wch: Math.max(key.length, 18),
    }));
    sheet["!cols"] = colWidths;

    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, sheet, "My Hotels");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Vendor_Hotels_List.xlsx"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Download coupons of a hotel
exports.downloadHotelCoupons = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const coupons = await Coupon.find({ hotelId, isDeleted: false }).sort({
      createdAt: -1,
    });

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({ message: "No coupons found to export." });
    }

    const tableData = coupons.map((coupon) => ({
      "Coupon Code": coupon.code,
      "Discount (%)": coupon.discount,
      "Max Discount Amount (₹)": coupon.maxDiscount,
      "Min Booking Amount (₹)": coupon.minPrice,
      Status: coupon.status.toUpperCase(),
      "Valid From": new Date(coupon.availFrom).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      "Expiry Date": new Date(coupon.expiryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      "Created On": new Date(coupon.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    const sheet = xlsx.utils.json_to_sheet(tableData);

    const colWidths = Object.keys(tableData[0]).map((key) => ({
      wch: Math.max(key.length, 18),
    }));
    sheet["!cols"] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, "Hotel Coupons");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Hotel_Coupons_List.xlsx"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
