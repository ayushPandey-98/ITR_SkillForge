import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import {
  adminGetAllCourses,
  adminGetCourseById,
  adminCreateCourse,
  adminEditCourse,
  adminRemoveCourse,
} from "../controllers/adminCourseController.js";

const router = express.Router();

const courseManagerOnly = (req, res, next) => {
  if (!["admin", "manager"].includes(req.role)) {
    return res.status(403).json({ message: "Admin or manager only" });
  }
  return next();
};

router.get("/courses", isAuth, courseManagerOnly, adminGetAllCourses);
router.get("/courses/:courseId", isAuth, courseManagerOnly, adminGetCourseById);

// create course (thumbnail optional)
router.post("/courses", isAuth, courseManagerOnly, upload.single("thumbnail"), adminCreateCourse);

// edit course
router.patch("/courses/:courseId", isAuth, courseManagerOnly, upload.single("thumbnail"), adminEditCourse);

// remove course
router.delete("/courses/:courseId", isAuth, courseManagerOnly, adminRemoveCourse);

export default router;

