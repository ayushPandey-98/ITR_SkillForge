import mongoose from "mongoose";

const mcqOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "text"],
      default: "mcq",
      required: true,
    },
    prompt: { type: String, required: true },

    // MCQ specific
    options: {
      type: [mcqOptionSchema],
      default: [],
    },
    correctOptionIndex: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const courseAssessmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // assignment | quiz
    assessmentType: {
      type: String,
      enum: ["assignment", "quiz"],
      required: true,
    },

    title: { type: String, required: true },

    // time based test
    durationMinutes: { type: Number, required: true, min: 1 },

    // MCQ etc
    questions: { type: [questionSchema], default: [] },

    // optional publish
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Allow multiple assessments per course

const CourseAssessment = mongoose.model(
  "CourseAssessment",
  courseAssessmentSchema,
);

export default CourseAssessment;
