import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Store assignment target employees
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Persist per-employee status (e.g. learning, completed, failed)
    statusByEmployee: {
      type: Map,
      of: {
        type: String,
        default: "assigned",
      },
      default: {},
    },
  },
  { timestamps: true }
);

// Ensure one assignment record per (course, assignedBy) to keep it auditable.
// Employees may be updated by pushing to assignedTo.
assignmentSchema.index({ course: 1, assignedBy: 1 }, { unique: true });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;

