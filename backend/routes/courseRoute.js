import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorById, getCreatorCourses, getPublishedCourses, removeCourse, removeLecture } from "../controllers/courseController.js"
import upload from "../middlewares/multer.js"

let courseRouter = express.Router()

const courseManagerOnly = (req, res, next) => {
    if (!["admin", "manager"].includes(req.role)) {
        return res.status(403).json({message:"Admin or manager only"})
    }
    return next()
}

courseRouter.post("/create",isAuth,courseManagerOnly,createCourse)
courseRouter.get("/getpublishedcoures",getPublishedCourses)
courseRouter.get("/getcreatorcourses",isAuth,courseManagerOnly,getCreatorCourses)
courseRouter.post("/editcourse/:courseId",isAuth,courseManagerOnly,upload.single("thumbnail"),editCourse)
courseRouter.get("/getcourse/:courseId",isAuth,getCourseById)
courseRouter.delete("/removecourse/:courseId",isAuth,courseManagerOnly,removeCourse)
courseRouter.post(
  "/createlecture/:courseId",
  isAuth,
  courseManagerOnly,
  upload.fields([
    { name: "pdfFiles", maxCount: 10 },
    { name: "videoFiles", maxCount: 10 },
  ]),
  createLecture
);

courseRouter.get("/getcourselecture/:courseId",isAuth,getCourseLecture)
courseRouter.post(
  "/editlecture/:lectureId",
  isAuth,
  courseManagerOnly,
  upload.fields([
    { name: "pdfFiles", maxCount: 10 },
    { name: "videoFiles", maxCount: 10 },
    // keep backward compatible for old single field (optional)
    { name: "videoUrl", maxCount: 1 },
  ]),
  editLecture
)

courseRouter.delete("/removelecture/:lectureId",isAuth,courseManagerOnly,removeLecture)
courseRouter.post("/getcreator",isAuth,getCreatorById)







export default courseRouter
