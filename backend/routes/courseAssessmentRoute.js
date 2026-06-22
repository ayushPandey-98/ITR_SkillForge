import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  adminCreateAssessment,
  adminListAssessmentsByCourse,
} from "../controllers/courseAssessmentController.js";

const router = express.Router();

const courseManagerOnly = (req, res, next) => {
  if (!["admin", "manager"].includes(req.role)) {
    return res.status(403).json({ message: "Admin or manager only" });
  }
  return next();
};

router.post(
  "/courses/:courseId/assessments",
  isAuth,
  courseManagerOnly,
  adminCreateAssessment
);

router.get(
  "/courses/:courseId/assessments",
  isAuth,
  courseManagerOnly,
  adminListAssessmentsByCourse
);

export default router;

