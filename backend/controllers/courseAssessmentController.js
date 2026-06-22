import Course from "../models/courseModel.js";
import CourseAssessment from "../models/courseAssessmentModel.js";

export const adminCreateAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { assessmentType, title, durationMinutes, questions } = req.body;

    if (!courseId) return res.status(400).json({ message: "courseId is required" });
    if (!assessmentType) {
      return res.status(400).json({ message: "assessmentType is required" });
    }
    if (!title) return res.status(400).json({ message: "title is required" });
    if (!durationMinutes) {
      return res.status(400).json({ message: "durationMinutes is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let parsedQuestions = questions;
    if (typeof parsedQuestions === "string") {
      parsedQuestions = JSON.parse(parsedQuestions);
    }

    if (!Array.isArray(parsedQuestions)) {
      return res.status(400).json({ message: "questions must be an array" });
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    const assessment = await CourseAssessment.create({
      course: courseId,
      createdBy: req.userId,
      assessmentType,
      title,
      durationMinutes,
      questions: parsedQuestions,
      isPublished: req.body.isPublished === true || req.body.isPublished === "true" || false,
    });

    return res.status(201).json(assessment);
  } catch (e) {
    return res.status(500).json({ message: `Failed to create assessment: ${e.message}` });
  }
};

export const adminListAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const assessments = await CourseAssessment.find({ course: courseId })
      .sort({ createdAt: -1 });

    return res.status(200).json(assessments);
  } catch (e) {
    return res.status(500).json({ message: `Failed to load assessments: ${e.message}` });
  }
};

