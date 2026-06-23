import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import {
  HiOutlineArrowLeft,
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiMiniCheck,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineDocumentText,
  HiOutlineFilm,
  HiOutlineLink,
  HiOutlineUserCircle,
  HiOutlineListBullet,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLockClosed,
} from "react-icons/hi2";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.sf-display{font-family:'Space Grotesk',sans-serif}
.sf-mono{font-family:'JetBrains Mono',monospace}
`;

const MATERIAL_META = {
  pdf: {
    icon: HiOutlineDocumentText,
    label: "PDF",
    color: "#E11D48",
    bg: "#FFF1F2",
  },
  video: {
    icon: HiOutlineFilm,
    label: "Video",
    color: "#0EA5E9",
    bg: "#EFF9FF",
  },
  videoLink: {
    icon: HiOutlineLink,
    label: "Video Link",
    color: "#7C3AED",
    bg: "#F3EEFF",
  },
};

function Spinner({ size = 5 }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin`}
    />
  );
}

export default function ViewLecture() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courseData } = useSelector((s) => s.course);
  const { userData } = useSelector((s) => s.user);

  const selectedCourse = useMemo(
    () => courseData?.find((c) => c._id === courseId),
    [courseData, courseId],
  );

  const [selectedLecture, setSelectedLecture] = useState(
    selectedCourse?.lectures?.[0] || null,
  );
  const [completedKeys, setCompletedKeys] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [currentMatIdx, setCurrentMatIdx] = useState(0);

  const courseCreator =
    userData?._id === selectedCourse?.creator ? userData : null;

  // ── valid materials for the selected lecture ───────────────
  const lectureMaterials = useMemo(
    () =>
      (selectedLecture?.materials || []).filter((m) => {
        if (!m?.type) return false;
        if (m.type === "pdf") return !!m.fileUrl;
        if (m.type === "video") return !!m.fileUrl;
        if (m.type === "videoLink") return !!m.videoLink;
        return false;
      }),
    [selectedLecture],
  );

  const currentMaterial = lectureMaterials[currentMatIdx] || null;

  // ── reset material index when lecture changes ──────────────
  useEffect(() => {
    setCurrentMatIdx(0);
  }, [selectedLecture?._id]);

  // ── load progress ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!courseId || !userData?._id) return;
      setProgressLoading(true);
      try {
        const r = await axios.get(
          `${serverUrl}/api/course-progress/courses/${courseId}/progress`,
          { withCredentials: true },
        );
        setCompletedKeys(r.data?.completedMaterialsKeys || []);
      } catch (e) {
        console.error(e);
      } finally {
        setProgressLoading(false);
      }
    };
    load();
  }, [courseId, userData?._id]);

  // ── completed key for current material ────────────────────
  const currentKey = selectedLecture?._id
    ? `${selectedLecture._id}:${currentMatIdx}:${currentMaterial?.type}`
    : null;
  const isCurrentDone = currentKey ? completedKeys.includes(currentKey) : false;

  // ── is a given lecture+material combo done? ───────────────
  const isMaterialDone = (lecId, matIdx, matType) =>
    completedKeys.includes(`${lecId}:${matIdx}:${matType}`);

  const isLectureDone = (lec) => {
    const mats = (lec.materials || []).filter((m) => {
      if (m.type === "pdf" || m.type === "video") return !!m.fileUrl;
      if (m.type === "videoLink") return !!m.videoLink;
      return false;
    });
    if (!mats.length) return false;
    return mats.every((m, i) =>
      completedKeys.includes(`${lec._id}:${i}:${m.type}`),
    );
  };

  // ── mark current as complete ──────────────────────────────
  const handleMarkComplete = async () => {
    if (!selectedLecture?._id || !currentMaterial || isCurrentDone) return;
    setMarkingComplete(true);
    try {
      await axios.post(
        `${serverUrl}/api/course-progress/courses/${courseId}/lectures/${selectedLecture._id}/materials/${currentMatIdx}/complete-material`,
        { type: currentMaterial.type },
        { withCredentials: true },
      );
      setCompletedKeys((prev) => {
        if (prev.includes(currentKey)) return prev;
        return [...prev, currentKey];
      });
      toast.success("Material marked complete!");
    } catch (e) {
      toast.error("Failed to mark complete.");
    } finally {
      setMarkingComplete(false);
    }
  };

  // ── navigate materials ────────────────────────────────────
  const goPrev = () => {
    if (currentMatIdx > 0) setCurrentMatIdx((i) => i - 1);
  };
  const goNext = () => {
    if (!isCurrentDone) {
      toast.info("Complete this material first.");
      return;
    }
    if (currentMatIdx + 1 < lectureMaterials.length) {
      setCurrentMatIdx((i) => i + 1);
    } else {
      toast.success("All materials in this lecture complete!");
    }
  };

  // ── PDF url resolution ────────────────────────────────────
  const resolvePdfUrl = (url) =>
    url?.startsWith("/api/") ? `${serverUrl}${url}` : url;

  const lectures = selectedCourse?.lectures || [];
  const meta = currentMaterial
    ? MATERIAL_META[currentMaterial.type] || MATERIAL_META.pdf
    : null;

  return (
    <div
      className="min-h-screen bg-[#F4F5FA]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{STYLE}</style>

      {/* ── Sticky header ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E8F1] sticky top-0 z-20">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl border border-[#E7E8F1] flex items-center justify-center hover:bg-[#F4F5FA] transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="w-[17px] h-[17px] text-[#3A3F55]" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="sf-display text-[17px] font-semibold text-[#0B1220] truncate leading-tight">
              {selectedCourse?.title || "Course"}
            </p>
            <div className="hidden sm:flex items-center gap-3 text-[12px] text-[#8A8FA3]">
              {selectedCourse?.category && (
                <span>{selectedCourse.category}</span>
              )}
              {selectedCourse?.level && (
                <>
                  <span>·</span>
                  <span>{selectedCourse.level}</span>
                </>
              )}
            </div>
          </div>
          {progressLoading && <Spinner size={5} />}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-5">
        {/* ─────────── LEFT: viewer ─────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* material viewer */}
          <div className="bg-[#0B1220] rounded-2xl overflow-hidden">
            <div className="aspect-video relative">
              {progressLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Spinner size={8} />
                  <p className="text-[13px] text-white/50">Loading…</p>
                </div>
              ) : !currentMaterial ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <HiOutlinePlay className="w-7 h-7 text-white/40" />
                  </div>
                  <p className="text-[13px] text-white/40">
                    Select a lecture to begin
                  </p>
                </div>
              ) : currentMaterial.type === "pdf" ? (
                <div className="w-full h-full bg-white">
                  <iframe
                    src={resolvePdfUrl(currentMaterial.fileUrl)}
                    title="PDF Viewer"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : currentMaterial.type === "video" ? (
                <video
                  src={currentMaterial.fileUrl}
                  controls
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              ) : currentMaterial.type === "videoLink" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                    <HiOutlineLink className="w-7 h-7 text-[#A78BFA]" />
                  </div>
                  <p className="text-[13px] text-white/60 text-center">
                    External video link
                  </p>
                  <a
                    href={currentMaterial.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-[10px] rounded-xl text-[13.5px] font-semibold bg-[#7C3AED] text-white hover:bg-[#5B21B6] transition-colors"
                  >
                    Open Video{" "}
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                  </a>
                  <p className="text-[11.5px] text-white/30 break-all text-center max-w-sm">
                    {currentMaterial.videoLink}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[13px] text-white/40">
                    No preview available
                  </p>
                </div>
              )}
            </div>

            {/* viewer footer */}
            {currentMaterial && (
              <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3 flex-wrap">
                {meta && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-[4px] rounded-full"
                    style={{
                      color: meta.color,
                      backgroundColor: `${meta.color}25`,
                    }}
                  >
                    <meta.icon className="w-[12px] h-[12px]" /> {meta.label}
                  </span>
                )}
                {currentMaterial.title && (
                  <span className="text-[13px] text-white/60">
                    {currentMaterial.title}
                  </span>
                )}
                {isCurrentDone && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#14B8A6] bg-[#14B8A6]/15 px-2.5 py-[4px] rounded-full">
                    <HiMiniCheck className="w-[13px] h-[13px]" /> Completed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* controls card */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="sf-display text-[16px] font-semibold text-[#0B1220]">
                  {selectedLecture?.lectureTitle || "Select a lecture"}
                </p>
                <p className="text-[13px] text-[#8A8FA3] mt-1">
                  {lectureMaterials.length > 0
                    ? `Material ${currentMatIdx + 1} of ${lectureMaterials.length}${currentMaterial?.title ? ` · ${currentMaterial.title}` : ""}`
                    : "No materials in this lecture"}
                </p>

                {/* material dots */}
                {lectureMaterials.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {lectureMaterials.map((m, i) => {
                      const done = isMaterialDone(
                        selectedLecture?._id,
                        i,
                        m.type,
                      );
                      const active = i === currentMatIdx;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentMatIdx(i)}
                          title={`Material ${i + 1}${done ? " (done)" : ""}`}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-[10px] font-bold
                            ${
                              active
                                ? "bg-[#7C3AED] text-white"
                                : done
                                  ? "bg-[#14B8A6] text-white"
                                  : "bg-[#F4F5FA] text-[#9498AB] hover:bg-[#E7E8F1]"
                            }`}
                        >
                          {done && !active ? (
                            <HiMiniCheck className="w-[11px] h-[11px]" />
                          ) : (
                            i + 1
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={goPrev}
                  disabled={currentMatIdx === 0}
                  className="w-10 h-10 rounded-xl border border-[#E7E8F1] flex items-center justify-center hover:bg-[#F4F5FA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <HiOutlineChevronLeft className="w-[18px] h-[18px] text-[#3A3F55]" />
                </button>

                {!isCurrentDone ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={!currentMaterial || markingComplete}
                    className="flex items-center gap-2 px-5 py-[10px] rounded-xl text-[13.5px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {markingComplete ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                        Saving…
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-[16px] h-[16px]" />{" "}
                        Mark Complete
                      </>
                    )}
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-5 py-[10px] rounded-xl text-[13.5px] font-semibold text-white bg-[#14B8A6] cursor-default">
                    <HiMiniCheck className="w-[16px] h-[16px]" /> Completed
                  </button>
                )}

                <button
                  onClick={goNext}
                  disabled={!isCurrentDone}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${
                      isCurrentDone
                        ? "bg-[#0B1220] hover:bg-[#1E293B] text-white"
                        : "bg-[#F4F5FA] text-[#C3C6D4] cursor-not-allowed"
                    }`}
                >
                  <HiOutlineChevronRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* hint when locked */}
            {!isCurrentDone && currentMaterial && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFF6E8] border border-[#FDE68A]">
                <HiOutlineLockClosed className="w-[14px] h-[14px] text-[#B45309] shrink-0" />
                <p className="text-[12px] text-[#92400E]">
                  Mark this material complete to unlock the Next button
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─────────── RIGHT: lecture list ──────────────────── */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <HiOutlineListBullet className="w-[16px] h-[16px] text-[#7C3AED]" />
              All Lectures
              <span className="sf-mono text-[11.5px] text-[#9498AB] bg-[#F4F5FA] px-2 py-[2px] rounded-full ml-auto">
                {lectures.length}
              </span>
            </p>

            {lectures.length === 0 ? (
              <p className="text-[13px] text-[#9498AB] py-4 text-center">
                No lectures available
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lectures.map((lec, i) => {
                  const active = selectedLecture?._id === lec._id;
                  const done = isLectureDone(lec);
                  const validMats = (lec.materials || []).filter((m) =>
                    m.type === "pdf" || m.type === "video"
                      ? !!m.fileUrl
                      : m.type === "videoLink"
                        ? !!m.videoLink
                        : false,
                  );
                  const completedCount = validMats.filter((m, mi) =>
                    completedKeys.includes(`${lec._id}:${mi}:${m.type}`),
                  ).length;

                  return (
                    <button
                      key={lec._id || i}
                      type="button"
                      onClick={() => setSelectedLecture(lec)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl border text-left transition-all
                        ${
                          active
                            ? "border-[#7C3AED] bg-[#F3EEFF]"
                            : "border-[#E7E8F1] hover:border-[#C8CBDA] hover:bg-[#FAFBFD]"
                        }`}
                    >
                      {/* status indicator */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-[1px] transition-colors
                        ${done ? "bg-[#14B8A6]" : active ? "bg-[#7C3AED]" : "bg-[#F4F5FA]"}`}
                      >
                        {done ? (
                          <HiMiniCheck className="w-[14px] h-[14px] text-white" />
                        ) : active ? (
                          <HiOutlinePlay className="w-[13px] h-[13px] text-white" />
                        ) : (
                          <span className="sf-mono text-[10px] font-bold text-[#9498AB]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {lec.chapterTitle && (
                          <p className="text-[10.5px] text-[#9498AB] truncate mb-0.5">
                            {lec.chapterTitle}
                          </p>
                        )}
                        <p
                          className={`text-[13px] font-semibold leading-tight truncate ${active ? "text-[#5B21B6]" : done ? "text-[#0F766E]" : "text-[#0B1220]"}`}
                        >
                          {lec.lectureTitle}
                        </p>
                        {validMats.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {/* per-material dots */}
                            {validMats.map((m, mi) => {
                              const matDone = completedKeys.includes(
                                `${lec._id}:${mi}:${m.type}`,
                              );
                              const Icon =
                                MATERIAL_META[m.type]?.icon ||
                                HiOutlineDocumentText;
                              return (
                                <div
                                  key={mi}
                                  title={`${MATERIAL_META[m.type]?.label || m.type}${matDone ? " ✓" : ""}`}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors
                                    ${matDone ? "bg-[#14B8A6]" : "bg-[#F4F5FA]"}`}
                                >
                                  {matDone ? (
                                    <HiMiniCheck className="w-[10px] h-[10px] text-white" />
                                  ) : (
                                    <Icon className="w-[10px] h-[10px] text-[#9498AB]" />
                                  )}
                                </div>
                              );
                            })}
                            <span className="text-[10.5px] text-[#9498AB] ml-1">
                              {completedCount}/{validMats.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* instructor card */}
          {courseCreator && (
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <p className="sf-display text-[14px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
                <HiOutlineUserCircle className="w-[15px] h-[15px] text-[#7C3AED]" />{" "}
                Instructor
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#E7E8F1]">
                  {courseCreator.photoUrl ? (
                    <img
                      src={
                        courseCreator.photoUrl.startsWith("/api/files/")
                          ? `${serverUrl}${courseCreator.photoUrl}`
                          : courseCreator.photoUrl
                      }
                      alt={courseCreator.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F3EEFF] flex items-center justify-center">
                      <span className="sf-display font-bold text-[#7C3AED]">
                        {courseCreator.name?.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#0B1220]">
                    {courseCreator.name}
                  </p>
                  <p className="text-[12px] text-[#8A8FA3]">
                    {courseCreator.description || "Course facilitator"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
