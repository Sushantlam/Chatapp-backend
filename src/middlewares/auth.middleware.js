const User = require("../models/user.model");
const APIERROR = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncResponse = require("../utils/asyncResponse");
const jwt = require("jsonwebtoken");

const verifyJWT = asyncResponse(async (req, _, next) => {
  try {
    const token =
      (await req.cookies.token) ||
      req?.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      throw new APIERROR(401, "Unauthorized Access");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodeToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new APIERROR(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new APIERROR(401, error?.message || "Invalid access token");
  }
});

module.exports = { verifyJWT };
