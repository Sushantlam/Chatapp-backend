const User = require("../models/user.model");
const APIERROR = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncResponse = require("../utils/asyncResponse");
const jwt = require("jsonwebtoken");

//yo vaneko chae verify ta jwt before logging out
const verifyJWT = asyncResponse(async (req, _, next) => {
  try {
    //req.cookies chae kina aucha vanda kheri instead of req.body because yo chae verify garna
     //ko lagi use huncha when the user is already loggedin and tyo chae req.cookies bata pathaucha
    const token =
      req.cookies?.accesstoken ||
      req.header("Authorization")?.replace("Bearer ", "");

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
