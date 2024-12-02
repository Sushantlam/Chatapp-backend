const express = require("express")
const { verifyJWT } = require("../middlewares/auth.middleware.js")
const { accessChat, fetchChatOfUser, createGroupChat } = require("../controllers/chat.controller.js")
const router = express.Router()

router.route("/one-to-one").post(verifyJWT, accessChat)
router.route("/fetch-chat-of-user").post(verifyJWT, fetchChatOfUser)
router.route("/create-group-chat").post(verifyJWT, createGroupChat)

module.exports =router