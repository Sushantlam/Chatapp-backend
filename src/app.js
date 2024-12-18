const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
//router
const userRoute = require("./routes/user.route.js")
const chatRoute = require("./routes/chat.route.js")
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/user", userRoute)
app.use("/api/v1/chat", chatRoute)
module.exports= app