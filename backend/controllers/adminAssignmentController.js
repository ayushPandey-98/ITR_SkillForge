import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import Assignment from "../models/assignmentModel.js";

const normalizeObjectIdArray = (ids) => {
  if (!Array.isArray(ids)) return [];
  // remove falsy and duplicates (string compare)
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (!id) continue;
    const s = String(id);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(id);
  }
  return out;
};

export const adminListEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("name email role photoUrl");
    return res.status(200).json(employees);
  } catch (e) {
    return res.status(500).json({ message: `Failed to load employees: ${e.message}` });
  }
};

export const adminAssignCourseToEmployees = async (req, res) => {
  try {
    const { courseId, employeeIds } = req.body;

    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const normalizedEmployeeIds = normalizeObjectIdArray(employeeIds);
    if (normalizedEmployeeIds.length === 0) {
      return res.status(400).json({ message: "employeeIds must be a non-empty array" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Validate employees exist and are employees
    const employees = await User.find({ _id: { $in: normalizedEmployeeIds }, role: "employee" }).select("_id");
    const validEmployeeIds = employees.map((e) => e._id);

    if (validEmployeeIds.length === 0) {
      return res.status(400).json({ message: "No valid employees found" });
    }

    // Create/update assignment record
    // Idempotent for (course, assignedBy) due to unique index
    const assignedBy = req.userId;

    const update = {
      $addToSet: {
        assignedTo: { $each: validEmployeeIds },
      },
    };

    // Set statusByEmployee for any newly added employees to keep status consistent
    const statusPatch = {};
    for (const id of validEmployeeIds) {
      statusPatch[String(id)] = "assigned";
    }
    update.$set = {
      ...(update.$set || {}),
      ...Object.fromEntries(
        Object.entries(statusPatch).map(([k, v]) => [`statusByEmployee.${k}`, v])
      ),
    };

    const assignment = await Assignment.findOneAndUpdate(
      { course: courseId, assignedBy },
      update,
      { new: true, upsert: true }
    );

    // Also update enrollment collections so employee can start learning immediately.
    // Use $addToSet to avoid duplicates.
    await Course.updateOne(
      { _id: courseId },
      { $addToSet: { enrolledStudents: { $each: validEmployeeIds } } }
    );

    await User.updateMany(
      { _id: { $in: validEmployeeIds } },
      { $addToSet: { enrolledCourses: courseId } }
    );

    return res.status(200).json({
      message: "Course assigned successfully",
      courseId,
      assignedBy,
      employeeIds: validEmployeeIds,
      assignment,
    });
  } catch (e) {
    return res.status(500).json({ message: `Failed to assign course: ${e.message}` });
  }
};

