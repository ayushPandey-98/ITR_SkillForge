import Course from "../models/courseModel.js";
import CourseAssessment from "../models/courseAssessmentModel.js";
import CourseProgress from "../models/courseProgressModel.js";

const getOrCreateProgress = async (courseId, employeeId) => {
  let progress = await CourseProgress.findOne({ course: courseId, employee: employeeId });
  if (!progress) {
    progress = await CourseProgress.create({ course: courseId, employee: employeeId });
  }
  return progress;
};

const computeProgress = ({ totalMaterialsCount, completedMaterialsCount, quizStatus, finalAssignmentStatus }) => {
  // equal weight: 1 share per learning material (pdf/video/videoLink)
  // + 1 share for quiz (if passed)
  // + 1 share for final assignment (if submitted)
  const quizShare = 1;
  const finalShare = 1;
  const materialsShareTotal = totalMaterialsCount;

  const denominator = materialsShareTotal + quizShare + finalShare;
  if (denominator <= 0) return { percent: 0 };

  const numerator = completedMaterialsCount + (quizStatus === "passed" ? 1 : 0) + (finalAssignmentStatus === "submitted" ? 1 : 0);
  const percent = Math.round((numerator / denominator) * 100);

  return { percent, numerator, denominator };
};

export const employeeGetCourseProgressSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    const employeeId = req.userId;

    const course = await Course.findById(courseId).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const materialKeys = [];
    (course.lectures || []).forEach((lecture) => {
      (lecture.materials || []).forEach((m, idx) => {
        const type = m?.type;
        if (!type) return;
        // Only count actual learning materials with a url/link.
        const hasFile = typeof m?.fileUrl === "string" && m.fileUrl.trim().length > 0;
        const hasVideoLink = typeof m?.videoLink === "string" && m.videoLink.trim().length > 0;
        if (type === "pdf" && hasFile) {
          materialKeys.push(`${lecture._id}:${idx}:${type}`);
        } else if (type === "video" && hasFile) {
          materialKeys.push(`${lecture._id}:${idx}:${type}`);
        } else if (type === "videoLink" && hasVideoLink) {
          materialKeys.push(`${lecture._id}:${idx}:${type}`);
        }
      });
    });

    const totalMaterialsCount = materialKeys.length;

    const progress = await getOrCreateProgress(courseId, employeeId);

    const completedSet = new Set(progress.completedMaterials || []);
    let completedMaterialsCount = 0;
    for (const k of materialKeys) {
      if (completedSet.has(k)) completedMaterialsCount += 1;
    }


    // quiz/final are based on assessment presence; statuses are stored in progress
    const quizAssessment = await CourseAssessment.findOne({ course: courseId, assessmentType: "quiz" });
    const finalAssessment = await CourseAssessment.findOne({ course: courseId, assessmentType: "assignment" });

    const { percent } = computeProgress({
      totalMaterialsCount,
      completedMaterialsCount,
      quizStatus: progress.quizStatus,
      finalAssignmentStatus: progress.finalAssignmentStatus,
    });

    return res.status(200).json({
      courseId,
      percent,
      totalMaterialsCount,
      completedMaterialsCount,
      materialKeys,
      completedMaterialsKeys: progress.completedMaterials || [],
      completedPdfKeys: progress.completedPdfs || [],

      quiz: {
        exists: !!quizAssessment,
        status: progress.quizStatus,
        assessmentId: quizAssessment?._id || null,
        title: quizAssessment?.title || null,
      },
      finalAssignment: {
        exists: !!finalAssessment,
        status: progress.finalAssignmentStatus,
        assessmentId: finalAssessment?._id || null,
        title: finalAssessment?.title || null,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: `Failed to load progress: ${e.message}` });
  }
};

export const employeeMarkPdfComplete = async (req, res) => {
  // NOTE: kept for backward compatibility. New UI uses employeeMarkMaterialComplete.
  
  
  try {
    const { courseId, lectureId, materialIndex } = req.params;
    const employeeId = req.userId;

    if (!courseId || !lectureId || materialIndex === undefined) {
      return res.status(400).json({ message: "courseId, lectureId, materialIndex are required" });
    }

    const progress = await getOrCreateProgress(courseId, employeeId);

    const key = `${lectureId}:${Number(materialIndex)}`;
    const set = new Set(progress.completedPdfs || []);
    set.add(key);

    progress.completedPdfs = Array.from(set);
    await progress.save();

    return res.status(200).json({ message: "PDF marked complete", completedPdfKeys: progress.completedPdfs });
  } catch (e) {
    return res.status(500).json({ message: `Failed to mark pdf complete: ${e.message}` });
  }
};

export const employeeSubmitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const employeeId = req.userId;
    const { isPassed } = req.body;

    if (typeof isPassed !== "boolean") {
      return res.status(400).json({ message: "isPassed(boolean) is required" });
    }

    const progress = await getOrCreateProgress(courseId, employeeId);
    progress.quizStatus = isPassed ? "passed" : "failed";
    await progress.save();

    return res.status(200).json({ message: "Quiz updated", quizStatus: progress.quizStatus });
  } catch (e) {
    return res.status(500).json({ message: `Failed to submit quiz: ${e.message}` });
  }
};

export const employeeMarkMaterialComplete = async (req, res) => {
  try {
    const { courseId, lectureId, materialIndex } = req.params;
    const { type } = req.body;
    const employeeId = req.userId;

    if (!courseId || !lectureId || materialIndex === undefined) {
      return res.status(400).json({ message: "courseId, lectureId, materialIndex are required" });
    }
    if (!type || !["pdf", "video", "videoLink"].includes(type)) {
      return res.status(400).json({ message: "type must be pdf|video|videoLink" });
    }

    const progress = await getOrCreateProgress(courseId, employeeId);

    const key = `${lectureId}:${Number(materialIndex)}:${type}`;
    const set = new Set(progress.completedMaterials || []);
    set.add(key);
    progress.completedMaterials = Array.from(set);

    await progress.save();

    return res.status(200).json({ message: "Material marked complete", completedMaterialsKeys: progress.completedMaterials });
  } catch (e) {
    return res.status(500).json({ message: `Failed to mark material complete: ${e.message}` });
  }
};

export const employeeSubmitFinalAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const employeeId = req.userId;

    const progress = await getOrCreateProgress(courseId, employeeId);
    progress.finalAssignmentStatus = "submitted";
    await progress.save();

    return res.status(200).json({ message: "Final assignment submitted", finalAssignmentStatus: progress.finalAssignmentStatus });
  } catch (e) {
    return res.status(500).json({ message: `Failed to submit final assignment: ${e.message}` });
  }
};

