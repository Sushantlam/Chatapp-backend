const User = require("../models/user.model");
const APIERROR = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncResponse = require("../utils/asyncResponse");

const registerUser = asyncResponse(async (req, res) => {
  const { userName, email, password, avatar } = req.body;

  if ([userName, email, password].some((field) => field?.trim === "")) {
    throw new APIERROR(400, "All fields are required");
  }

  const userExist = await User.findOne({ email });
  if (userExist) throw new APIERROR(400, "User already exist");

  const user = await User.create({
    email,
    userName,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new APIERROR(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

module.exports = { registerUser };
