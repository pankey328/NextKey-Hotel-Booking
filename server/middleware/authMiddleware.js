const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token value is empty" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { email } = decoded;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email payload is missing from token" });
    }

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.user = userDetails;

    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Token not verified" });
  }
};
