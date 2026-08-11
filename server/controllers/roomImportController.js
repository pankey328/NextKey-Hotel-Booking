const Room = require("../models/RoomModel");

// PREVIEW ROOMS IMPORT & DATABASE DUPLICATE CHECK
exports.previewRoomsImport = async (req, res) => {
  try {
    const { hotelId, rawRows } = req.body;

    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required for rooms preview." });
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({ message: "No raw rows provided for room preview." });
    }

    const existingRooms = await Room.find({ hotelId, isDeleted: false });

    const previewItems = [];
    let newCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const tempId = `room-${index + 1}`;

      const roomNumber = (row["Room No."] || row["Room Number"] || row["roomNumber"] || row["Room #"] || "").toString().trim();
      const roomName = (row["Room Name"] || row["roomName"] || row["Name"] || "").toString().trim();
      const roomType = (row["Room Type"] || row["roomType"] || "Standard").toString().trim();
      const floorNumber = (row["Floor"] || row["floorNumber"] || "").toString().trim();
      const pricePerNight = Number(row["Price / Night (₹)"] || row["Price / Night"] || row["Price"] || row["pricePerNight"] || 0);
      const weekendPrice = Number(row["Weekend Price (₹)"] || row["Weekend Price"] || row["weekendPrice"] || 0);
      const holidayPrice = Number(row["Holiday Price (₹)"] || row["Holiday Price"] || row["holidayPrice"] || 0);
      const discount = Number(row["Discount (%)"] || row["Discount"] || row["discount"] || 0);
      const taxIncludedStr = (row["Tax Included"] || row["taxIncluded"] || "").toString().toLowerCase();
      const taxIncluded = taxIncludedStr === "yes" || taxIncludedStr === "true" || row["Tax Included"] === true;
      const maxAdults = Number(row["Max Adults"] || row["maxAdults"] || 2);
      const maxChildren = Number(row["Max Children"] || row["maxChildren"] || 0);
      const totalGuests = Number(row["Total Capacity"] || row["totalGuests"] || maxAdults + maxChildren);
      const numberOfBeds = Number(row["No. of Beds"] || row["numberOfBeds"] || 1);
      const bedType = (row["Bed Type"] || row["bedType"] || "King").toString().trim();
      const facilitiesRaw = row["Facilities"] || row["facilities"] || "";
      const facilities = typeof facilitiesRaw === "string"
        ? facilitiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(facilitiesRaw) ? facilitiesRaw : []);
      const description = (row["Description"] || row["description"] || "").toString().trim();

      if (!roomNumber || pricePerNight <= 0) {
        invalidCount++;
        previewItems.push({
          tempId,
          status: "invalid",
          error: !roomNumber ? "Room Number is required" : "Valid Price per night is required",
          data: { roomNumber, roomName, roomType, floorNumber, pricePerNight, weekendPrice, holidayPrice, discount, taxIncluded, maxAdults, maxChildren, totalGuests, numberOfBeds, bedType, facilities, description },
        });
        continue;
      }

      const match = existingRooms.find((r) => r.roomNumber.toString().trim() === roomNumber);
      if (match) {
        duplicateCount++;
        previewItems.push({
          tempId,
          status: "duplicate",
          action: "skip",
          existingData: {
            id: match._id,
            roomNumber: match.roomNumber,
            roomName: match.roomName,
            roomType: match.roomType,
            pricePerNight: match.pricePerNight,
          },
          data: { roomNumber, roomName, roomType, floorNumber, pricePerNight, weekendPrice, holidayPrice, discount, taxIncluded, maxAdults, maxChildren, totalGuests, numberOfBeds, bedType, facilities, description },
        });
      } else {
        newCount++;
        previewItems.push({
          tempId,
          status: "new",
          action: "create",
          data: { roomNumber, roomName, roomType, floorNumber, pricePerNight, weekendPrice, holidayPrice, discount, taxIncluded, maxAdults, maxChildren, totalGuests, numberOfBeds, bedType, facilities, description },
        });
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        total: previewItems.length,
        newCount,
        duplicateCount,
        invalidCount,
      },
      items: previewItems,
    });
  } catch (error) {
    console.error("Preview rooms import error:", error);
    return res.status(500).json({ message: error.message || "Error during room preview dry run." });
  }
};

// BULK IMPORT ROOMS
exports.confirmRoomsImport = async (req, res) => {
  try {
    const { hotelId, items } = req.body;

    if (!hotelId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid rooms import request payload." });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      if (item.action === "skip" || item.status === "invalid") {
        skippedCount++;
        continue;
      }

      const { data } = item;

      if (item.action === "update" && item.existingData?.id) {
        await Room.findByIdAndUpdate(item.existingData.id, {
          ...data,
          hotelId,
        });
        updatedCount++;
      } else {
        await Room.create({
          ...data,
          hotelId,
        });
        createdCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Rooms bulk import process completed successfully.",
      createdCount,
      updatedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("Confirm rooms import error:", error);
    return res.status(500).json({ message: error.message || "Error processing rooms import." });
  }
};
