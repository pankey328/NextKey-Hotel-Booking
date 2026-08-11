const Coupon = require("../models/CouponModel");

// PREVIEW COUPONS IMPORT & DATABASE DUPLICATE CHECK
exports.previewCouponsImport = async (req, res) => {
  try {
    const { hotelId, rawRows } = req.body;

    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required for coupons preview." });
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({ message: "No raw rows provided for coupon preview." });
    }

    const existingCoupons = await Coupon.find({ hotelId, isDeleted: false });

    const previewItems = [];
    let newCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const tempId = `coupon-${index + 1}`;

      const code = (row["Coupon Code"] || row["Code"] || row["code"] || "").toString().trim().toUpperCase();
      const discount = Number(row["Discount (%)"] || row["Discount"] || row["discount"] || 0);
      const maxDiscount = Number(row["Max Discount Amount (₹)"] || row["Max Discount"] || row["maxDiscount"] || 0);
      const minPrice = Number(row["Min Booking Amount (₹)"] || row["Min Price"] || row["minPrice"] || 0);
      const statusStr = (row["Status"] || row["status"] || "active").toString().toLowerCase();
      const status = statusStr === "inactive" ? "inactive" : "active";

      const rawAvail = row["Valid From"] || row["availFrom"] || row["Avail From"] || "";
      const rawExpiry = row["Expiry Date"] || row["expiryDate"] || row["Expiry"] || "";

      const availFromDate = rawAvail ? new Date(rawAvail) : new Date();
      const expiryDate = rawExpiry ? new Date(rawExpiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (!code || discount <= 0 || maxDiscount <= 0 || minPrice <= 0) {
        invalidCount++;
        previewItems.push({
          tempId,
          status: "invalid",
          error: !code ? "Coupon Code is required" : "Discount, Max Discount, and Min Price must be greater than 0",
          data: { code, discount, maxDiscount, minPrice, status, availFrom: availFromDate.toISOString().split("T")[0], expiryDate: expiryDate.toISOString().split("T")[0] },
        });
        continue;
      }

      const match = existingCoupons.find((c) => c.code.toString().trim().toUpperCase() === code);
      if (match) {
        duplicateCount++;
        previewItems.push({
          tempId,
          status: "duplicate",
          action: "skip",
          existingData: {
            id: match._id,
            code: match.code,
            discount: match.discount,
            maxDiscount: match.maxDiscount,
            minPrice: match.minPrice,
          },
          data: { code, discount, maxDiscount, minPrice, status, availFrom: availFromDate.toISOString().split("T")[0], expiryDate: expiryDate.toISOString().split("T")[0] },
        });
      } else {
        newCount++;
        previewItems.push({
          tempId,
          status: "new",
          action: "create",
          data: { code, discount, maxDiscount, minPrice, status, availFrom: availFromDate.toISOString().split("T")[0], expiryDate: expiryDate.toISOString().split("T")[0] },
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
    console.error("Preview coupons import error:", error);
    return res.status(500).json({ message: error.message || "Error during coupon preview dry run." });
  }
};

// BULK IMPORT COUPONS
exports.confirmCouponsImport = async (req, res) => {
  try {
    const { hotelId, items } = req.body;

    if (!hotelId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid coupons import request payload." });
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
        await Coupon.findByIdAndUpdate(item.existingData.id, {
          ...data,
          hotelId,
          availFrom: new Date(data.availFrom),
          expiryDate: new Date(data.expiryDate),
        });
        updatedCount++;
      } else {
        await Coupon.create({
          ...data,
          hotelId,
          availFrom: new Date(data.availFrom),
          expiryDate: new Date(data.expiryDate),
        });
        createdCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Coupons bulk import process completed successfully.",
      createdCount,
      updatedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("Confirm coupons import error:", error);
    return res.status(500).json({ message: error.message || "Error processing coupons import." });
  }
};
