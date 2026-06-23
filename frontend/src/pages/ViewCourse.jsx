import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import img from "../assets/empty.jpg";
import {
  HiOutlineArrowLeft,
  HiOutlinePlay,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineFilm,
  HiOutlineLink,
  HiOutlineUserCircle,
  HiOutlineTag,
  HiOutlineAcademicCap,
  HiOutlineListBullet,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineSparkles,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.sf-display{font-family:'Space Grotesk',sans-serif}
.sf-mono{font-family:'JetBrains Mono',monospace}
`;

const MATERIAL_ICONS = {
  pdf: HiOutlineDocumentText,
  video: HiOutlineFilm,
  videoLink: HiOutlineLink,
};
const MATERIAL_COLORS = {
  pdf: "#E11D48",
  video: "#0EA5E9",
  videoLink: "#7C3AED",
};

function ProgressRing({ value }) {
  const r = 28,
    circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#F1F2F7"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={value === 100 ? "#14B8A6" : "#7C3AED"}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <span className="sf-mono absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#0B1220]">
        {value}%
      </span>
    </div>
  );
}

function Chip({ children, color = "#6B7088", bg = "#F4F5FA" }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-[5px] rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

function resolveThumb(thumb) {
  if (!thumb) return img;
  if (thumb.startsWith("/api/files/")) return `${serverUrl}${thumb}`;
  if (thumb.startsWith("http")) return thumb;
  return thumb;
}

export default function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courseData } = useSelector((s) => s.course);
  const { userData } = useSelector((s) => s.user);

  const [creatorData, setCreatorData] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [freshCourse, setFreshCourse] = useState(null);

  const selectedCourseData = useMemo(
    () => courseData.find((c) => c._id === courseId),
    [courseData, courseId],
  );
  const displayedCourse = freshCourse || selectedCourseData;

  const assignedCourseIds = useMemo(
    () =>
      (userData?.enrolledCourses || []).map((c) =>
        typeof c === "string" ? c : c?._id,
      ),
    [userData?.enrolledCourses],
  );
  const isAssigned = assignedCourseIds.some(
    (id) => id?.toString() === courseId?.toString(),
  );
  const canManage = ["admin", "manager"].includes(userData?.role);

  // ── data fetches ──────────────────────────────────────────
  useEffect(() => {
    const getCreator = async () => {
      const creatorId =
        selectedCourseData?.creator?._id || selectedCourseData?.creator;
      if (!creatorId) return;
      try {
        const r = await axios.post(
          `${serverUrl}/api/course/getcreator`,
          { userId: creatorId },
          { withCredentials: true },
        );
        setCreatorData(r.data);
      } catch (e) {
        console.error(e);
      }
    };
    getCreator();
  }, [selectedCourseData]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const r = await axios.get(
          `${serverUrl}/api/admin/courses/${courseId}`,
          { withCredentials: true },
        );
        setFreshCourse(r.data);
      } catch (e) {
        setFreshCourse(null);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!courseId || !userData?._id) return;
      setProgressLoading(true);
      try {
        const r = await axios.get(
          `${serverUrl}/api/course-progress/courses/${courseId}/progress`,
          { withCredentials: true },
        );
        setProgressSummary(r.data);
      } catch (e) {
        setProgressSummary(null);
      } finally {
        setProgressLoading(false);
      }
    };
    loadProgress();
  }, [courseId, userData?._id]);

  const handleStart = () => {
    if (isAssigned || canManage) {
      navigate(`/viewlecture/${courseId}`);
      return;
    }
    toast.info("Ask your Manager or Admin to assign this course to you.");
  };

  const pct = progressSummary?.percent ?? 0;
  const lectures = selectedCourseData?.lectures || [];

  // ── material preview resolution ───────────────────────────
  const previewMaterial = selectedLecture?.materials?.[0] || null;

  return (
    <div
      className="min-h-screen bg-[#F4F5FA]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{STYLE}</style>

      {/* ── Sticky header ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E8F1] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl border border-[#E7E8F1] flex items-center justify-center hover:bg-[#F4F5FA] transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="w-[17px] h-[17px] text-[#3A3F55]" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="sf-display text-[17px] font-semibold text-[#0B1220] truncate leading-tight">
              {displayedCourse?.title || "Course"}
            </p>
            <p className="text-[12px] text-[#8A8FA3] hidden sm:block">
              Internal Skill Course
            </p>
          </div>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-[9px] rounded-xl text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors shadow-sm shrink-0"
          >
            <HiOutlinePlay className="w-[15px] h-[15px]" />
            {isAssigned || canManage ? "Start Learning" : "Request Access"}
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-5">
        {/* ── Hero: thumbnail + course info ─────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E7E8F1] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-[240px] md:h-auto md:min-h-[280px] bg-[#0B1220]">
              <img
                src={resolveThumb(displayedCourse?.thumbnail)}
                alt={displayedCourse?.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#7C3AED] bg-[#F3EEFF] px-2.5 py-[4px] rounded-full">
                  <HiOutlineSparkles className="w-[12px] h-[12px]" /> Internal
                  Skill Course
                </span>
                <h1 className="sf-display text-[22px] sm:text-[26px] font-semibold text-[#0B1220] mt-3 leading-snug">
                  {displayedCourse?.title || "Course"}
                </h1>
                {displayedCourse?.subTitle && (
                  <p className="text-[14px] text-[#6B7088] mt-2 leading-relaxed">
                    {displayedCourse.subTitle}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {displayedCourse?.category && (
                    <Chip color="#7C3AED" bg="#F3EEFF">
                      <HiOutlineTag className="w-[11px] h-[11px]" />{" "}
                      {displayedCourse.category}
                    </Chip>
                  )}
                  {displayedCourse?.level && (
                    <Chip color="#0F766E" bg="#ECFDF9">
                      <HiOutlineAcademicCap className="w-[11px] h-[11px]" />{" "}
                      {displayedCourse.level}
                    </Chip>
                  )}
                  <Chip color="#B45309" bg="#FFF6E8">
                    <HiOutlineListBullet className="w-[11px] h-[11px]" />
                    {lectures.length} lecture{lectures.length !== 1 ? "s" : ""}
                  </Chip>
                </div>
              </div>

              {/* progress card */}
              <div className="bg-[#F8F9FC] rounded-2xl border border-[#E7E8F1] p-4">
                {progressLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] text-[#9498AB]">
                      Loading progress…
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ProgressRing value={pct} />
                    <div className="flex-1 min-w-0">
                      <p className="sf-display text-[14px] font-semibold text-[#0B1220]">
                        {pct === 100
                          ? "Course Complete!"
                          : pct > 0
                            ? "In Progress"
                            : "Not Started"}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <p className="text-[11px] text-[#9498AB]">PDFs</p>
                          <p className="sf-mono text-[12px] font-semibold text-[#0B1220]">
                            {progressSummary?.completedPdfCount ?? 0}/
                            {progressSummary?.totalPdfCount ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9498AB]">Quiz</p>
                          <p className="text-[12px] font-medium text-[#0B1220]">
                            {progressSummary?.quiz?.exists
                              ? progressSummary.quiz.status
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9498AB]">Final</p>
                          <p className="text-[12px] font-medium text-[#0B1220]">
                            {progressSummary?.finalAssignment?.exists
                              ? progressSummary.finalAssignment.status
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-[13px] rounded-xl text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors"
              >
                <HiOutlinePlay className="w-[17px] h-[17px]" />
                {isAssigned || canManage
                  ? "Start / Continue Learning"
                  : "Request Assignment"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Overview + Facilitator ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#E7E8F1] p-6">
            <p className="sf-display text-[16px] font-semibold text-[#0B1220] mb-3 flex items-center gap-2">
              <HiOutlineBookOpen className="w-[17px] h-[17px] text-[#7C3AED]" />{" "}
              Course Overview
            </p>
            <p className="text-[13.5px] text-[#52566B] leading-relaxed">
              {displayedCourse?.description ||
                `This course helps employees build and validate practical ${displayedCourse?.category || "skill"} knowledge within ITRadiant.`}
            </p>

            <p className="sf-display text-[15px] font-semibold text-[#0B1220] mt-6 mb-3">
              What You Will Validate
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Core concepts and practical understanding of the skill area",
                "Applied knowledge through assignments and puzzles",
                "Assessment readiness for earning an internal skill badge",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-[13px] text-[#52566B]"
                >
                  <HiOutlineCheckCircle className="w-[16px] h-[16px] text-[#14B8A6] shrink-0 mt-[1px]" />
                  {t}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#F1F2F7]">
              <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-3">
                How It Works
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    n: "01",
                    t: "Complete PDFs",
                    d: "Work through assigned material step-by-step",
                  },
                  {
                    n: "02",
                    t: "Pass the Quiz",
                    d: "Validate your knowledge with a timed assessment",
                  },
                  {
                    n: "03",
                    t: "Earn Your Badge",
                    d: "Progress updates 0→100% and badge is awarded",
                  },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="bg-[#F8F9FC] rounded-xl p-3 border border-[#F1F2F7]"
                  >
                    <span className="sf-mono text-[11px] font-bold text-[#9498AB]">
                      {s.n}
                    </span>
                    <p className="text-[13px] font-semibold text-[#0B1220] mt-1">
                      {s.t}
                    </p>
                    <p className="text-[12px] text-[#8A8FA3] mt-0.5 leading-snug">
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* facilitator */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-6 h-fit">
            <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <HiOutlineUserCircle className="w-[16px] h-[16px] text-[#7C3AED]" />{" "}
              Facilitator
            </p>
            {creatorData ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#E7E8F1]">
                    {creatorData.photoUrl ? (
                      <img
                        src={creatorData.photoUrl}
                        alt={creatorData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F3EEFF] flex items-center justify-center">
                        <span className="sf-display font-bold text-[#7C3AED] text-[16px]">
                          {creatorData.name?.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0B1220]">
                      {creatorData.name}
                    </p>
                    <p className="text-[12px] text-[#8A8FA3] capitalize">
                      {creatorData.role || "Manager"}
                    </p>
                  </div>
                </div>
                {creatorData.email && (
                  <p className="text-[12.5px] text-[#6B7088] mt-3 break-all">
                    {creatorData.email}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <HiOutlineUserCircle className="w-10 h-10 text-[#C3C6D4]" />
                <p className="text-[13px] text-[#9498AB]">
                  Facilitator info unavailable
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Learning Materials + Preview ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* lecture list */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <HiOutlineListBullet className="w-[16px] h-[16px] text-[#7C3AED]" />
              Learning Materials
              <span className="sf-mono text-[11.5px] text-[#9498AB] bg-[#F4F5FA] px-2 py-[2px] rounded-full ml-auto">
                {lectures.length}
              </span>
            </p>
            <div className="flex flex-col gap-2">
              {lectures.length === 0 && (
                <div className="py-8 text-center text-[13px] text-[#9498AB]">
                  No materials yet
                </div>
              )}
              {lectures.map((lec, i) => {
                const free = lec.isPreviewFree;
                const active =
                  selectedLecture?.lectureTitle === lec.lectureTitle;
                return (
                  <button
                    key={lec._id || i}
                    disabled={!free}
                    onClick={() => free && setSelectedLecture(lec)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all
                      ${active ? "border-[#7C3AED] bg-[#F3EEFF]" : free ? "border-[#E7E8F1] hover:border-[#C8CBDA] hover:bg-[#FAFBFD]" : "border-[#F1F2F7] opacity-50 cursor-not-allowed"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                      ${active ? "bg-[#7C3AED]" : free ? "bg-[#F3EEFF]" : "bg-[#F4F5FA]"}`}
                    >
                      {free ? (
                        <HiOutlinePlay
                          className={`w-[13px] h-[13px] ${active ? "text-white" : "text-[#7C3AED]"}`}
                        />
                      ) : (
                        <HiOutlineLockClosed className="w-[13px] h-[13px] text-[#C3C6D4]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {lec.chapterTitle && (
                        <p className="text-[10.5px] text-[#9498AB] truncate">
                          {lec.chapterTitle}
                        </p>
                      )}
                      <p
                        className={`text-[13px] font-medium truncate leading-tight ${active ? "text-[#5B21B6]" : "text-[#0B1220]"}`}
                      >
                        {lec.lectureTitle}
                      </p>
                    </div>
                    {!free && (
                      <span className="text-[10.5px] font-medium text-[#9498AB] bg-[#F4F5FA] px-1.5 py-0.5 rounded shrink-0">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* preview panel */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-[#E7E8F1] overflow-hidden">
            {/* viewer */}
            <div className="aspect-video bg-[#0B1220] relative">
              {!previewMaterial ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <HiOutlinePlay className="w-7 h-7 text-white/50" />
                  </div>
                  <p className="text-[13px] text-white/50">
                    Select an available material to preview
                  </p>
                </div>
              ) : previewMaterial.type === "video" &&
                previewMaterial.fileUrl ? (
                <video
                  src={previewMaterial.fileUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : previewMaterial.type === "videoLink" &&
                previewMaterial.videoLink ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <HiOutlineLink className="w-8 h-8 text-white/50" />
                  <p className="text-[13px] text-white/60">Video link</p>
                  <a
                    href={previewMaterial.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#14B8A6] hover:text-[#0F9E8E] break-all text-center"
                  >
                    Open video{" "}
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              ) : previewMaterial.type === "pdf" && previewMaterial.fileUrl ? (
                <div className="w-full h-full bg-white">
                  <object
                    data={
                      previewMaterial.fileUrl.startsWith("/api/")
                        ? `${serverUrl}${previewMaterial.fileUrl}`
                        : previewMaterial.fileUrl
                    }
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <iframe
                      src={
                        previewMaterial.fileUrl.startsWith("/api/")
                          ? `${serverUrl}${previewMaterial.fileUrl}`
                          : previewMaterial.fileUrl
                      }
                      title="PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </object>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[13px] text-white/50">
                    No preview available
                  </p>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="sf-display text-[15px] font-semibold text-[#0B1220]">
                {selectedLecture?.lectureTitle || "Learning Material"}
              </p>
              <p className="text-[13px] text-[#8A8FA3] mt-0.5">
                {displayedCourse?.title}
              </p>
              {previewMaterial && (
                <div className="flex items-center gap-2 mt-3">
                  {(() => {
                    const Icon =
                      MATERIAL_ICONS[previewMaterial.type] ||
                      HiOutlineDocumentText;
                    const color =
                      MATERIAL_COLORS[previewMaterial.type] || "#6B7088";
                    return (
                      <Chip color={color} bg={`${color}14`}>
                        <Icon className="w-[11px] h-[11px]" />
                        {previewMaterial.type === "videoLink"
                          ? "Video Link"
                          : previewMaterial.type.toUpperCase()}
                      </Chip>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
