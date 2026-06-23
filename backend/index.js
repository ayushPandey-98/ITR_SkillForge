import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import aiRouter from "./routes/aiRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import adminUserRoute from "./routes/adminUserRoute.js"
import adminCourseRoute from "./routes/adminCourseRoute.js"
import adminAssignmentRoute from "./routes/adminAssignmentRoute.js"
import courseAssessmentRoute from "./routes/courseAssessmentRoute.js"
import courseProgressRoute from "./routes/courseProgressRoute.js"
import fileRoute from "./routes/fileRoute.js"




dotenv.config()

let port = process.env.PORT
let app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    allowedHeaders: ["Content-Type", "Range"],
    exposedHeaders: ["Content-Range", "Content-Length"],
    methods: ["GET","OPTIONS"],
}));

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/ai", aiRouter)
app.use("/api/review", reviewRouter)
app.use("/api/admin", adminUserRoute)
app.use("/api/admin", adminCourseRoute)
app.use("/api/admin", adminAssignmentRoute)
app.use("/api/admin", courseAssessmentRoute)
app.use("/api/course-progress", courseProgressRoute)
app.use("/api/files", fileRoute)








app.get("/" , (req,res)=>{

    res.send("Hey Ayush ,Hello From Server")
})

app.listen(port , ()=>{
    console.log("Server Started "+ port)
    connectDb()
})


