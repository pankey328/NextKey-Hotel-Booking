require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

mongoose
  .connect(url)
  .then(() => console.log(`DATABASE Connected`))
  .catch((error) => console.log(`Database Error:`, error));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
