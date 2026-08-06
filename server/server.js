require("dotenv").config();
require("./utils/cronJobs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

const url = process.env.MONGO_URI;
const clientUrl = process.env.CLIENT_URL;
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

const userRouter = require("./routes/userRoutes");
app.use("/api/auth", userRouter);

// STATE ROUTES
const stateRoutes = require("./routes/stateRoutes");
app.use("/api/states", stateRoutes);

// DISTRICT ROUTES
const districtRoutes = require("./routes/districtRoutes");
app.use("/api/districts", districtRoutes);

// CITY ROUTES
const cityRoutes = require("./routes/cityRoutes");
app.use("/api/cities", cityRoutes);

// HOTEL ROUTES
const hotelRoutes = require("./routes/hotelRoutes");
app.use("/api/hotels", hotelRoutes);

// VENDOR (ADMIN) ROUTES
const vendorRoutes = require("./routes/vendorRoutes");
app.use("/api/vendors", vendorRoutes);

// ROOM ROUTeS
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

// COUPONS ROUTES
const couponsRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponsRoutes);

// SEARCH ROUTES
const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);

// BOOKING ROUTES
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

// SUPERADMIN ROUTES
const superadminRoutes = require("./routes/superadminRoutes");
app.use("/api/superadmin", superadminRoutes);

// EXPORT ROUTES
const exportRoutes = require("./routes/exportRoutes")
app.use("/api/export", exportRoutes);

mongoose
  .connect(url)
  .then(() => console.log(`DATABASE Connected`))
  .catch((error) => console.log(`Database Error:`, error));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
