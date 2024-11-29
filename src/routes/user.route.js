const express = require("express")
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require("../controllers/user.controller")
const { verifyJWT } = require("../middlewares/auth.middleware.js")
const router = express.Router()


router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

module.exports= router