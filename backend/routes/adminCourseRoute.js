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
  // admin/manager can manage; learners can still view course details.
  // We will enforce role checks only for write operations.
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

