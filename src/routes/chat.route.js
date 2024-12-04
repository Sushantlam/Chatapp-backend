const express = require("express")
const { verifyJWT } = require("../middlewares/auth.middleware.js")
const { accessChat, fetchChatOfUser, createGroupChat, changeChatName, addUserToGroup } = require("../controllers/chat.controller.js")
const router = express.Router()

router.route("/one-to-one").post(verifyJWT, accessChat)
router.route("/fetch-chat-of-user").post(verifyJWT, fetchChatOfUser)
router.route("/create-group-chat").post(verifyJWT, createGroupChat)
router.route("/update-chat-name").put( changeChatName)
router.route("/addUserToGroup").put( addUserToGroup)
module.exports =router