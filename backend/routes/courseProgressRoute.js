import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  employeeGetCourseProgressSummary,
  employeeMarkPdfComplete,
  employeeSubmitQuiz,
  employeeSubmitFinalAssignment,
  employeeMarkMaterialComplete,
} from "../controllers/courseProgressController.js";

const router = express.Router();

// employee only (role filtering is handled inside isAuth or controller)
router.get("/courses/:courseId/progress", isAuth, employeeGetCourseProgressSummary);

router.post(
  "/courses/:courseId/lectures/:lectureId/materials/:materialIndex/complete-pdf",
  isAuth,
  employeeMarkPdfComplete
);

// new generic endpoint for pdf/video/videoLink completion
router.post(
  "/courses/:courseId/lectures/:lectureId/materials/:materialIndex/complete-material",
  isAuth,
  employeeMarkMaterialComplete
);


router.post("/courses/:courseId/quiz/submit", isAuth, employeeSubmitQuiz);
router.post("/courses/:courseId/final/submit", isAuth, employeeSubmitFinalAssignment);

export default router;

