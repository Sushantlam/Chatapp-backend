const express = require("express")
const { registerUser, loginUser, logoutUser } = require("../controllers/user.controller")
const { verifyJWT } = require("../middlewares/auth.middleware.js")
const router = express.Router()


router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)

module.exports= router