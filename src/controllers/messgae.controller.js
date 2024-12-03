const Message = require("../models/message.model");
const APIERROR = require("../utils/apiError");
const asyncResponse = require("../utils/asyncResponse");


const sendMessage = asyncResponse(async(req,res)=>{
    const {chatId, message } = req.body;
    if(!chatId){
        throw new APIERROR(401, "Chat doesnt found")
    }
    if(!message && message ===""){
        throw new APIERROR(401, "No message to send")
    }
    var newMessage ={
        sender :req.user._id,
        message: message,
        chat: chatId,
    }
    try {
        const createMessage = await Message.create(newMessage)
    } catch (error) {
        
    }
})