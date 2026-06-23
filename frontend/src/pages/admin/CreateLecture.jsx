import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../../App";
import { useDispatch, useSelector } from "react-redux";
import { setLectureData } from "../../redux/lectureSlice";
import {
  HiOutlineArrowLeft,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
  HiOutlineFilm,
  HiOutlineLink,
  HiOutlineBookOpen,
  HiOutlineListBullet,
  HiOutlineArrowUpTray,
  HiOutlineXMark,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.sf-display{font-family:'Space Grotesk',sans-serif}
.sf-mono{font-family:'JetBrains Mono',monospace}
.sf-input{width:100%;background:#F8F9FC;border:1px solid #E7E8F1;border-radius:12px;font-size:13.5px;color:#0B1220;outline:none;padding:10px 12px;transition:border .15s,box-shadow .15s;font-family:'Inter',sans-serif}
.sf-input::placeholder{color:#BABFC8}
.sf-input:focus{border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
.sf-label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#3A3F55;margin-bottom:6px;font-family:'Inter',sans-serif}
`;

const TYPE_META = {
  pdf: {
    icon: HiOutlineDocumentText,
    label: "PDF",
    color: "#E11D48",
    bg: "#FFF1F2",
  },
  video: {
    icon: HiOutlineFilm,
    label: "Video Upload",
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

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

function FieldLabel({ icon: Icon, text, required }) {
  return (
    <label className="sf-label">
      {Icon && <Icon className="w-[13px] h-[13px] text-[#9498AB]" />}
      {text}
      {required && <span className="text-[#F43F5E] ml-0.5">*</span>}
    </label>
  );
}

export default function CreateLecture() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { lectureData } = useSelector((s) => s.lecture);

  const [lectureTitle, setLectureTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [materials, setMaterials] = useState([
    { type: "pdf", title: "", file: null, videoLink: "" },
  ]);
  const [loading, setLoading] = useState(false);

  // ── fetch existing lectures ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const r = await axios.get(
          `${serverUrl}/api/course/getcourselecture/${courseId}`,
          { withCredentials: true },
        );
        dispatch(setLectureData(r.data.lectures));
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load lectures");
      }
    };
    if (courseId) load();
  }, [courseId]);

  const visibleLectures = useMemo(() => lectureData || [], [lectureData]);

  // ── material helpers ─────────────────────────────────────
  const addMaterial = () =>
    setMaterials((p) => [
      ...p,
      { type: "videoLink", title: "", file: null, videoLink: "" },
    ]);

  const patchMaterial = (idx, patch) =>
    setMaterials((p) => p.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  const removeMaterial = (idx) =>
    setMaterials((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));

  // ── submit ───────────────────────────────────────────────
  const save = async () => {
    if (!lectureTitle.trim() || !courseId) {
      toast.error("Chapter title and lecture title are required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("lectureTitle", lectureTitle);
      fd.append("chapterTitle", chapterTitle || "");
      fd.append("isPreviewFree", false);

      const payloadMaterials = materials.map((m) => ({
        type: m.type,
        title: m.title || "",
        videoLink: m.type === "videoLink" ? m.videoLink || "" : "",
        fileUrl: "",
      }));
      fd.append("materials", JSON.stringify(payloadMaterials));

      materials.forEach((m) => {
        if (!m.file) return;
        if (m.type === "pdf") fd.append("pdfFiles", m.file);
        if (m.type === "video") fd.append("videoFiles", m.file);
      });

      const r = await axios.post(
        `${serverUrl}/api/course/createlecture/${courseId}`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Lecture created successfully");
      dispatch(setLectureData([...lectureData, r.data.lecture]));
      setLectureTitle("");
      setChapterTitle("");
      setMaterials([{ type: "pdf", title: "", file: null, videoLink: "" }]);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{STYLE}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: form ─────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* chapter & lecture titles */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <p className="sf-display text-[14.5px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <HiOutlineBookOpen className="w-[16px] h-[16px] text-[#7C3AED]" />{" "}
              Lecture Info
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel icon={HiOutlineListBullet} text="Chapter Title" />
                <input
                  className="sf-input"
                  placeholder="e.g. Chapter 1: Introduction"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel
                  icon={HiOutlineBookOpen}
                  text="Lecture Title"
                  required
                />
                <input
                  className="sf-input"
                  placeholder="e.g. What is React?"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* materials */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="sf-display text-[14.5px] font-semibold text-[#0B1220] flex items-center gap-2">
                <HiOutlineArrowUpTray className="w-[16px] h-[16px] text-[#7C3AED]" />
                Materials
                <span className="sf-mono text-[11.5px] font-medium text-[#9498AB] bg-[#F4F5FA] px-2 py-[2px] rounded-full">
                  {materials.length}
                </span>
              </p>
              <button
                type="button"
                onClick={addMaterial}
                className="flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-[12.5px] font-semibold text-[#7C3AED] bg-[#F3EEFF] hover:bg-[#EDE1FF] transition-colors"
              >
                <HiOutlinePlusCircle className="w-[15px] h-[15px]" /> Add
                Material
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {materials.map((m, idx) => {
                const meta = TYPE_META[m.type];
                return (
                  <div
                    key={idx}
                    className="border border-[#E7E8F1] rounded-xl overflow-hidden"
                  >
                    {/* material header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFBFD] border-b border-[#F1F2F7]">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: meta.bg }}
                      >
                        <meta.icon
                          className="w-[14px] h-[14px]"
                          style={{ color: meta.color }}
                        />
                      </div>
                      <span className="sf-display text-[13px] font-semibold text-[#0B1220] flex-1">
                        Material {idx + 1}
                      </span>

                      {/* type pills */}
                      <div className="flex items-center gap-1">
                        {Object.entries(TYPE_META).map(([key, tm]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              patchMaterial(idx, {
                                type: key,
                                file: null,
                                videoLink: "",
                              })
                            }
                            className="flex items-center gap-1 px-2 py-[4px] rounded-lg text-[11.5px] font-medium transition-colors"
                            style={
                              m.type === key
                                ? { backgroundColor: tm.color, color: "#fff" }
                                : {
                                    backgroundColor: "#F4F5FA",
                                    color: "#6B7088",
                                  }
                            }
                          >
                            <tm.icon className="w-[11px] h-[11px]" /> {tm.label}
                          </button>
                        ))}
                      </div>

                      {materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterial(idx)}
                          className="w-7 h-7 rounded-lg bg-[#FFF1F2] flex items-center justify-center hover:bg-[#FFE1E4] transition-colors shrink-0 ml-1"
                        >
                          <HiOutlineXMark className="w-[14px] h-[14px] text-[#F43F5E]" />
                        </button>
                      )}
                    </div>

                    {/* material fields */}
                    <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <FieldLabel text="Material Title" />
                        <input
                          className="sf-input"
                          value={m.title}
                          onChange={(e) =>
                            patchMaterial(idx, { title: e.target.value })
                          }
                          placeholder="Label for this material (optional)"
                        />
                      </div>

                      {m.type === "videoLink" && (
                        <div>
                          <FieldLabel
                            icon={HiOutlineLink}
                            text="Video URL"
                            required
                          />
                          <input
                            className="sf-input"
                            type="url"
                            value={m.videoLink}
                            onChange={(e) =>
                              patchMaterial(idx, { videoLink: e.target.value })
                            }
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      )}

                      {(m.type === "pdf" || m.type === "video") && (
                        <div>
                          <FieldLabel
                            icon={
                              m.type === "pdf"
                                ? HiOutlineDocumentText
                                : HiOutlineFilm
                            }
                            text={m.type === "pdf" ? "PDF File" : "Video File"}
                            required
                          />
                          <label className="block">
                            <input
                              type="file"
                              accept={
                                m.type === "pdf" ? "application/pdf" : "video/*"
                              }
                              className="hidden"
                              onChange={(e) =>
                                patchMaterial(idx, {
                                  file: e.target.files?.[0] || null,
                                })
                              }
                            />
                            <div
                              className="sf-input flex items-center gap-2 cursor-pointer"
                              onClick={(e) =>
                                e.currentTarget.previousSibling?.click?.()
                              }
                            >
                              <HiOutlineArrowUpTray className="w-[14px] h-[14px] text-[#9498AB] shrink-0" />
                              <span
                                className="truncate"
                                style={{
                                  color: m.file ? "#0B1220" : "#BABFC8",
                                }}
                              >
                                {m.file
                                  ? m.file.name
                                  : `Choose ${m.type === "pdf" ? "PDF" : "video"} file`}
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* save button inside panel for quick access */}
            <div className="mt-4 pt-4 border-t border-[#F1F2F7] flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={save}
                className="flex-1 flex items-center justify-center gap-2 py-[12px] rounded-xl text-[13.5px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <HiOutlineCheckCircle className="w-[16px] h-[16px]" />
                )}
                {loading ? "Saving…" : "Save Lecture & Materials"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: existing lectures ────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5 h-fit">
          <p className="sf-display text-[14.5px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
            <HiOutlineListBullet className="w-[16px] h-[16px] text-[#7C3AED]" />
            Lectures
            <span className="sf-mono text-[11.5px] font-medium text-[#9498AB] bg-[#F4F5FA] px-2 py-[2px] rounded-full ml-auto">
              {visibleLectures.length}
            </span>
          </p>

          {visibleLectures.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-center">
              <HiOutlineBookOpen className="w-8 h-8 text-[#C3C6D4]" />
              <p className="text-[13px] text-[#9498AB]">No lectures yet</p>
              <p className="text-[12px] text-[#C3C6D4]">
                Your saved lectures will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleLectures.map((lec, i) => (
                <div
                  key={lec._id || i}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#F1F2F7] hover:border-[#E7E8F1] hover:bg-[#FAFBFD] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0">
                    <span className="sf-mono text-[10px] font-semibold text-[#7C3AED]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {lec.chapterTitle && (
                      <p className="text-[10.5px] text-[#9498AB] truncate">
                        {lec.chapterTitle}
                      </p>
                    )}
                    <p className="text-[13px] font-medium text-[#0B1220] truncate leading-tight">
                      {lec.lectureTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/editlecture/${courseId}/${lec._id}`)
                    }
                    className="w-7 h-7 rounded-lg bg-[#F4F5FA] flex items-center justify-center hover:bg-[#E7E8F1] transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <HiOutlinePencilSquare className="w-[13px] h-[13px] text-[#6B7088]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
