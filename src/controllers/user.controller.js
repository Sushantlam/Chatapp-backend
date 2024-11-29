const User = require("../models/user.model");
const APIERROR = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncResponse = require("../utils/asyncResponse");

const registerUser = asyncResponse(async (req, res) => {
  console.log(req.body);
  
  const { userName, email, password } = req.body;

  if ([userName, email, password].some((field) => field?.trim === "")) {
    throw new APIERROR(400, "All fields are required");
  }

  const userExist = await User.findOne({ email });
  if (userExist) throw new APIERROR(400, "User already exist");

  const user = await User.create({
    email,
    userName,
    password,
    avatar: req.body?.avatar?.url,
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

const generateAccessAndRefreshToken = async (userId) => {
  try {
  
    
    const user = await User.findById(userId);
    
    const accessToken = user.generateAccessToken();
    
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIERROR(500, "Something went wrong generating token");
  }
};

const loginUser = asyncResponse(async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    throw new APIERROR(400, "All credential is required");
  }
  const isUser = await User.findOne({ email });
  if (!isUser) throw new APIERROR(400, "User is not registered");
  const isPassword = await isUser.isPasswordCorrect(password);
  if (!isPassword) throw new APIERROR(400, "Password wrong");
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    isUser._id
  );

  const loggedIn = await User.findById(isUser._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedIn,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});


const logoutUser = asyncResponse(async(req,res)=>{
  
  await User.findByIdAndUpdate(req.user._id,
    {
    
      $unset: {
          refreshToken: 1 
      }
  
  },
  {new:true}
)
const options = {
  httpOnly: true,
  secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})

module.exports = { registerUser, loginUser, logoutUser };
