import uploadOnCloudinary from "../configs/cloudinary.js";
import Course from "../models/courseModel.js";

export const adminGetAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("creator lectures reviews");
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get courses: ${error.message}` });
  }
};

export const adminGetCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("creator lectures reviews");
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get course: ${error.message}` });
  }
};

export const adminCreateCourse = async (req, res) => {
  try {
    const { title, category, creator, subTitle, description, level, isPublished } = req.body;

    if (!title || !category || !creator) {
      return res
        .status(400)
        .json({ message: "title, category and creator(userId) are required" });
    }

    let thumbnail;
    if (req.file) thumbnail = await uploadOnCloudinary(req.file.path);

    const course = await Course.create({
      title,
      subTitle: subTitle || "",
      description: description || "",
      category,
      level,
      thumbnail,
      creator,
      isPublished: isPublished === "true" || isPublished === true,
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create course: ${error.message}` });
  }
};

export const adminEditCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, subTitle, description, category, level, isPublished } = req.body;

    let thumbnail;
    if (req.file) thumbnail = await uploadOnCloudinary(req.file.path);

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const updateData = {
      title,
      subTitle,
      description,
      category,
      level,
      isPublished: isPublished === "true" || isPublished === true,
      ...(thumbnail ? { thumbnail } : {}),
    };

    const updated = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: `Failed to edit course: ${error.message}` });
  }
};

export const adminRemoveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.deleteOne();
    return res.status(200).json({ message: "Course removed" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to remove course: ${error.message}` });
  }
};

