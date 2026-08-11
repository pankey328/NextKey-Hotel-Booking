const { v4: uuidv4 } = require("uuid");
const Hotel = require("../models/HotelModel");
const State = require("../models/StateModel");
const District = require("../models/DistrictModel");
const City = require("../models/CityModel");

// PREVIEW HOTELS IMPORT & DATABASE DUPLICATE CHECK
exports.previewHotelsImport = async (req, res) => {
  try {
    const { vendorId, rawRows } = req.body;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required for hotels preview." });
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({ message: "No raw rows provided for hotel preview." });
    }

    const existingHotels = await Hotel.find({ vendorId, isDeleted: false });

    const previewItems = [];
    let newCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const tempId = `hotel-${index + 1}`;

      const name = (row["Hotel Name"] || row["Name"] || row["name"] || "").toString().trim();
      const hotelType = (row["Hotel Type"] || row["Type"] || row["hotelType"] || "Hotel").toString().trim();
      const email = (row["Email"] || row["email"] || "").toString().trim().toLowerCase();
      const phone = (row["Phone"] || row["phone"] || "").toString().trim();
      const address = (row["Address"] || row["address"] || "").toString().trim();
      const starRating = Number(row["Star Rating"] || row["starRating"] || 3);
      const stateName = (row["State"] || row["stateName"] || "").toString().trim();
      const districtName = (row["District"] || row["districtName"] || "").toString().trim();
      const cityName = (row["City"] || row["cityName"] || "").toString().trim();
      const featuresRaw = row["Features"] || row["features"] || "";
      const features = typeof featuresRaw === "string"
        ? featuresRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      if (!name || !email || !phone || !address) {
        invalidCount++;
        previewItems.push({
          tempId,
          status: "invalid",
          error: "Name, Email, Phone, and Address are required",
          data: { name, hotelType, email, phone, address, starRating, stateName, districtName, cityName, features },
        });
        continue;
      }

      const match = existingHotels.find(
        (h) => h.name.toLowerCase() === name.toLowerCase() || h.email.toLowerCase() === email.toLowerCase() || h.phone === phone,
      );

      if (match) {
        duplicateCount++;
        previewItems.push({
          tempId,
          status: "duplicate",
          action: "skip",
          existingData: {
            id: match._id,
            name: match.name,
            email: match.email,
            phone: match.phone,
          },
          data: { name, hotelType, email, phone, address, starRating, stateName, districtName, cityName, features },
        });
      } else {
        newCount++;
        previewItems.push({
          tempId,
          status: "new",
          action: "create",
          data: { name, hotelType, email, phone, address, starRating, stateName, districtName, cityName, features },
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
    console.error("Preview hotels import error:", error);
    return res.status(500).json({ message: error.message || "Error during hotel preview dry run." });
  }
};

// BULK IMPORT HOTELS
exports.confirmHotelsImport = async (req, res) => {
  try {
    const { vendorId, items } = req.body;

    if (!vendorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid hotels import request payload." });
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

      let stateObj = null;
      let districtObj = null;
      let cityObj = null;

      if (data.stateName) {
        stateObj = await State.findOne({ name: new RegExp(`^${data.stateName.trim()}$`, "i"), isDeleted: false });
      }
      if (!stateObj) {
        stateObj = await State.findOne({ isDeleted: false });
      }

      if (stateObj && data.districtName) {
        districtObj = await District.findOne({ name: new RegExp(`^${data.districtName.trim()}$`, "i"), stateId: stateObj._id, isDeleted: false });
      }
      if (!districtObj && stateObj) {
        districtObj = await District.findOne({ stateId: stateObj._id, isDeleted: false });
      }

      if (districtObj && data.cityName) {
        cityObj = await City.findOne({ name: new RegExp(`^${data.cityName.trim()}$`, "i"), districtId: districtObj._id, isDeleted: false });
      }
      if (!cityObj && districtObj) {
        cityObj = await City.findOne({ districtId: districtObj._id, isDeleted: false });
      }

      if (!stateObj || !districtObj || !cityObj) {
        skippedCount++;
        continue;
      }

      const hotelPayload = {
        name: data.name,
        hotelType: data.hotelType || "Hotel",
        email: data.email,
        phone: data.phone,
        address: data.address,
        starRating: data.starRating || 3,
        features: data.features || [],
        stateId: stateObj._id,
        districtId: districtObj._id,
        cityId: cityObj._id,
        vendorId,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
        status: "pending",
      };

      if (item.action === "update" && item.existingData?.id) {
        await Hotel.findByIdAndUpdate(item.existingData.id, hotelPayload);
        updatedCount++;
      } else {
        hotelPayload.trackingId = `HTL-${uuidv4().slice(0, 8).toUpperCase()}`;
        await Hotel.create(hotelPayload);
        createdCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Hotels bulk import process completed successfully.",
      createdCount,
      updatedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("Confirm hotels import error:", error);
    return res.status(500).json({ message: error.message || "Error processing hotels import." });
  }
};
