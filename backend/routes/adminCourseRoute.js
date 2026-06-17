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

const adminOnly = (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
};

router.get("/courses", isAuth, adminOnly, adminGetAllCourses);
router.get("/courses/:courseId", isAuth, adminOnly, adminGetCourseById);

// create course (thumbnail optional)
router.post("/courses", isAuth, adminOnly, upload.single("thumbnail"), adminCreateCourse);

// edit course
router.patch("/courses/:courseId", isAuth, adminOnly, upload.single("thumbnail"), adminEditCourse);

// remove course
router.delete("/courses/:courseId", isAuth, adminOnly, adminRemoveCourse);

export default router;

