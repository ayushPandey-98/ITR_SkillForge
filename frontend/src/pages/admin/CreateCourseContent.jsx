import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateLecture from "./CreateLecture";
import CreateAssessment from "./CreateAssessment";
import {
  HiOutlineArrowLeft,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.sf-display{font-family:'Space Grotesk',sans-serif}
.sf-mono{font-family:'JetBrains Mono',monospace}
`;

const TABS = [
  {
    key: "lecture",
    label: "Lecture & Materials",
    icon: HiOutlineBookOpen,
    desc: "Add chapters, lectures, PDFs, and video content",
  },
  {
    key: "assessment",
    label: "Quiz & Assignments",
    icon: HiOutlineClipboardDocumentCheck,
    desc: "Build MCQ quizzes and timed assignments",
  },
];

export default function CreateCourseContent() {
  const [activeTab, setActiveTab] = useState("lecture");
  const navigate = useNavigate();
  const { courseId } = useParams();

  const activeTabMeta = TABS.find((t) => t.key === activeTab);

  return (
    <div
      className="min-h-screen bg-[#F4F5FA]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{STYLE}</style>

      {/* ── Sticky page header ──────────────────────────── */}
      <div className="bg-white border-b border-[#E7E8F1] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-3">
          <button
            onClick={() =>
              navigate(courseId ? `/admin/courses` : "/admin/courses")
            }
            className="w-9 h-9 rounded-xl border border-[#E7E8F1] flex items-center justify-center hover:bg-[#F4F5FA] transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="w-[17px] h-[17px] text-[#3A3F55]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="sf-display text-[17px] font-semibold text-[#0B1220] leading-tight">
              Course Content
            </h1>
            <p className="text-[12px] text-[#8A8FA3] hidden sm:block truncate">
              {activeTabMeta?.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab switcher ────────────────────────────────── */}
      <div className="bg-white border-b border-[#E7E8F1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex items-center gap-2 px-4 py-[10px] rounded-xl text-[13.5px] font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: "#7C3AED", color: "#fff" }
                      : { color: "#6B7088" }
                  }
                >
                  <tab.icon className="w-[16px] h-[16px] shrink-0" />
                  <span>{tab.label}</span>
                  {/* indicator dot for unselected hover */}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl hover:bg-[#F4F5FA] transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page body ───────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* breadcrumb strip */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#F3EEFF" }}
          >
            {activeTab === "lecture" ? (
              <HiOutlineBookOpen className="w-[16px] h-[16px] text-[#7C3AED]" />
            ) : (
              <HiOutlineClipboardDocumentCheck className="w-[16px] h-[16px] text-[#7C3AED]" />
            )}
          </div>
          <div>
            <p className="sf-display text-[15px] font-semibold text-[#0B1220] leading-tight">
              {activeTabMeta?.label}
            </p>
            <p className="text-[12px] text-[#8A8FA3]">{activeTabMeta?.desc}</p>
          </div>
        </div>

        {/* render active tab content */}
        <div key={activeTab}>
          {activeTab === "lecture" ? <CreateLecture /> : <CreateAssessment />}
        </div>
      </div>
    </div>
  );
}
