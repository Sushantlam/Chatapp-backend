const asyncResponse = require("../utils/asyncResponse");
const User = require("../models/user.model");
const APIERROR = require("../utils/apiError");
const Chat = require("../models/chats.model");
const ApiResponse = require("../utils/apiResponse");

//yesle one on one chat create gareko cha vaney garcha natra gardaina
const accessChat = asyncResponse(async (req, res) => {
  const { receiverID } = req.body;

  try {
    const findreceiverID = await User.findById(receiverID);
    if (!findreceiverID) throw new APIERROR(401, "User not found");
    //yeta ako id ko user haru ko chat cha ki chaina hercha
    var isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: receiverID } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    //yesma if cha vaney users ko detail dekhaucha excluding password and latestMessage ni dekhaucha

    if (!isChat) throw new APIERROR(401, "Chat not found");
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "userName avatar email",
    });
    //yeta chae isChat ma chae user model bata userName , avatar haru display garchan

    if (isChat.length > 0) {
      //isCat yedi true vayo vaney yesari aucha
      //Example:----
      //   [
      // {
      //   "_id": "674d56614c3a2cf998601ff2",
      //   "chatName": "sender",
      //   "isGroupChat": false,
      //   "users": [
      //     {
      //       "_id": "674d533d4fdaf089694baae4",
      //       "userName": "John",
      //       "email": "john@gmail.com",
      //       "avatar": "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      //       "__v": 0,
      //       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzRkNTMzZDRmZGFmMDg5Njk0YmFhZTQiLCJpYXQiOjE3MzMxMjE1ODUsImV4cCI6MTczMzk4NTU4NX0.MzhXxvH2d7D8kgVcKqmes11dw0LJ-5pwt2_dzf8hlyw"
      //     }}]

      //isChat le array create garcha because mongoose return an array after its true
      return res
        .status(201)
        .json(new ApiResponse(201, isChat, "Send chat list"));
    } else {
      var createChat = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, receiverID],
      };
      const createdChat = await Chat.create(createChat);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(201).json(new ApiResponse(201, FullChat, "FullChat"));
    }
  } catch (error) {
    throw new APIERROR(401, "Error creating chat");
  }
});

//fetch all the chat of a single user

const fetchChatOfUser = asyncResponse(async (req, res) => {
  const user = req.user._id;
  if (!user) throw new APIERROR(401, "User not found");
  try {
    const chat = await Chat.find({ users: { $elemMatch: { $eq: user } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    return res.status(201).json(new ApiResponse(201, chat, "Fetched all chat"));
  } catch (error) {
    throw new APIERROR(401, "Error fetching chat");
  }
});

//creating group chat

const createGroupChat = asyncResponse(async (req, res) => {
  var users = req.body.users;
  users = [...users, req.user._id.toString()];

  if (users.length < 2) {
    throw new APIERROR(401, "User should be more than 2");
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return res
      .status(201)
      .json(new ApiResponse(200, fullGroupChat, "Group chat created"));
  } catch (error) {
    res.status(400);
    throw new APIERROR(401, "Error creating group");
  }
});

const changeChatName = asyncResponse(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId) {
    throw new APIERROR(401, "Chat ID is not found");
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    );

    if (!updatedChat) {
      throw new APIERROR(401, "Chat with this ID not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedChat, "Chat name changed successfully")
      );
  } catch (error) {
    throw new APIERROR(501, "Error updating chatname");
  }
});

const addUserToGroup = asyncResponse(async (req, res) => {
  const { userId, chatId } = req.body;

  try {
    const newMember = await User.findById(userId);
    if (!newMember) {
      throw new APIERROR(401, "User not found");
    }

    const isUserInGroup = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] },
    });

    if (isUserInGroup) {
      throw new APIERROR(401, "User is already in the group");
    }

    console.log("Adding user to group...");
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    ).populate("users", "-password");

    if (!updatedChat) {
      throw new APIERROR(401, "Failed to update chat");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedChat, "User added successfully"));
  } catch (error) {
    console.error("Error adding user:", error);
    if (error instanceof APIERROR) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      return res
        .status(501)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
});

module.exports = {
  accessChat,
  fetchChatOfUser,
  createGroupChat,
  changeChatName,
  addUserToGroup,
};
