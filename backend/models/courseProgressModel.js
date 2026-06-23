import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Track completion per lecture + material index + type
    // key format: `${lectureId}:${materialIndex}:${type}`
    completedMaterials: {
      type: [String],
      default: [],
    },

    // Backward-compatible PDF-only completion (older data)
    // key format: `${lectureId}:${materialIndex}`
    completedPdfs: {
      type: [String],
      default: [],
    },

    quizStatus: {
      type: String,
      enum: ["not_started", "passed", "failed"],
      default: "not_started",
    },

    finalAssignmentStatus: {
      type: String,
      enum: ["not_submitted", "submitted"],
      default: "not_submitted",
    },
  },
  { timestamps: true }
);

courseProgressSchema.index({ course: 1, employee: 1 }, { unique: true });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
export default CourseProgress;

