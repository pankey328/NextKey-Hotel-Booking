const express = require("express");
const router = express.Router();

const roomImportController = require("../controllers/roomImportController");
const couponImportController = require("../controllers/couponImportController");
const hotelImportController = require("../controllers/hotelImportController");

router.post("/rooms/preview", roomImportController.previewRoomsImport);
router.post("/rooms/confirm", roomImportController.confirmRoomsImport);

router.post("/coupons/preview", couponImportController.previewCouponsImport);
router.post("/coupons/confirm", couponImportController.confirmCouponsImport);

router.post("/hotels/preview", hotelImportController.previewHotelsImport);
router.post("/hotels/confirm", hotelImportController.confirmHotelsImport);

module.exports = router;
