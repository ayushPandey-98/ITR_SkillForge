import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  adminGetAllUsers,
  adminCreateUser,
  adminUpdateUserRole,
  adminDeleteUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

// ADMIN only
router.get("/users", isAuth, (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
}, adminGetAllUsers);

router.post("/users", isAuth, (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
}, adminCreateUser);

router.patch("/users/:userId/role", isAuth, (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
}, adminUpdateUserRole);

router.delete("/users/:userId", isAuth, (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Admin only" });
  return next();
}, adminDeleteUser);

export default router;

