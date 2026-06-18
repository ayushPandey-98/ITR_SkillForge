import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { adminListEmployees, adminAssignCourseToEmployees } from "../controllers/adminAssignmentController.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
};

// list employees for assignment
router.get("/employees", isAuth, adminOnly, adminListEmployees);

// assign course to selected employees
router.post("/assign-course", isAuth, adminOnly, adminAssignCourseToEmployees);

export default router;

