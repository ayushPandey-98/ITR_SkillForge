import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const sanitizeUser = (user) => {
  // `select(-password)` ensures password isn't returned, but keep safe.
  if (!user) return user;
  return user;
};

export const adminGetAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get users: ${error.message}` });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, description } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ message: "email already exist" });

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
      description: description || "",
    });

    const created = await User.findById(user._id).select("-password");
    return res.status(201).json(sanitizeUser(created));
  } catch (error) {
    return res.status(500).json({ message: `Failed to create user: ${error.message}` });
  }
};

export const adminUpdateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "role is required" });

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: `Failed to update user role: ${error.message}` });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete user: ${error.message}` });
  }
};

