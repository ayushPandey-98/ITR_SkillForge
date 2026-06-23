import axios from "axios";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineQuestionMarkCircle,
  HiOutlineAcademicCap,
  HiMiniCheck,
} from "react-icons/hi2";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.sf-display{font-family:'Space Grotesk',sans-serif}
.sf-mono{font-family:'JetBrains Mono',monospace}
.sf-input{width:100%;background:#F8F9FC;border:1px solid #E7E8F1;border-radius:12px;font-size:13.5px;color:#0B1220;outline:none;padding:10px 12px;transition:border .15s,box-shadow .15s;font-family:'Inter',sans-serif}
.sf-input::placeholder{color:#BABFC8}
.sf-input:focus{border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
`;

const emptyOption = () => ({ text: "" });
const emptyQuestion = () => ({
  type: "mcq",
  prompt: "",
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
  correctOptionIndex: 0,
});

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

function FieldLabel({ icon: Icon, text, required }) {
  return (
    <label
      className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3A3F55] mb-1.5"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {Icon && <Icon className="w-[13px] h-[13px] text-[#9498AB]" />}
      {text}
      {required && <span className="text-[#F43F5E] ml-0.5">*</span>}
    </label>
  );
}

export default function CreateAssessment() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState("quiz");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const canSubmit = useMemo(() => {
    if (
      !courseId ||
      !title.trim() ||
      !durationMinutes ||
      Number(durationMinutes) <= 0
    )
      return false;
    return questions.every(
      (q) =>
        q.prompt?.trim() &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.every((o) => o.text?.trim()),
    );
  }, [courseId, title, durationMinutes, questions]);

  // ── question helpers ─────────────────────────────────────
  const updateQ = (idx, patch) =>
    setQuestions((p) => p.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  const updateOpt = (qi, oi, patch) =>
    setQuestions((p) =>
      p.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              options: q.options.map((o, j) =>
                j === oi ? { ...o, ...patch } : o,
              ),
            },
      ),
    );
  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (idx) =>
    setQuestions((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));
  const addOption = (qi) =>
    setQuestions((p) =>
      p.map((q, i) =>
        i !== qi ? q : { ...q, options: [...q.options, emptyOption()] },
      ),
    );
  const removeOption = (qi, oi) =>
    setQuestions((p) =>
      p.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              options: q.options.filter((_, j) => j !== oi),
              correctOptionIndex:
                q.correctOptionIndex === oi
                  ? 0
                  : q.correctOptionIndex > oi
                    ? q.correctOptionIndex - 1
                    : q.correctOptionIndex,
            },
      ),
    );

  // ── submit ───────────────────────────────────────────────
  const submit = async () => {
    if (!canSubmit) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/admin/courses/${courseId}/assessments`,
        {
          assessmentType,
          title,
          durationMinutes: Number(durationMinutes),
          isPublished: true,
          questions: questions.map((q) => ({
            type: q.type,
            prompt: q.prompt,
            options: q.options.map((o) => ({ text: o.text })),
            correctOptionIndex: Number(q.correctOptionIndex) || 0,
          })),
        },
        { withCredentials: true },
      );
      toast.success(
        `${assessmentType === "quiz" ? "Quiz" : "Assignment"} created successfully`,
      );
      setTitle("");
      setDurationMinutes(15);
      setQuestions([emptyQuestion()]);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const completePct = Math.round(
    (questions.filter(
      (q) => q.prompt?.trim() && q.options.every((o) => o.text?.trim()),
    ).length /
      questions.length) *
      100,
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{STYLE}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: question builder ──────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* header config */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <p className="sf-display text-[14.5px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <HiOutlineClipboardDocumentCheck className="w-[16px] h-[16px] text-[#7C3AED]" />{" "}
              Assessment Settings
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* type toggle */}
              <div>
                <FieldLabel icon={HiOutlineAcademicCap} text="Type" required />
                <div className="flex gap-2">
                  {[
                    { val: "quiz", label: "Quiz" },
                    { val: "assignment", label: "Assignment" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAssessmentType(val)}
                      className="flex-1 py-[10px] rounded-xl text-[12.5px] font-semibold transition-colors"
                      style={
                        assessmentType === val
                          ? { backgroundColor: "#7C3AED", color: "#fff" }
                          : {
                              backgroundColor: "#F4F5FA",
                              color: "#6B7088",
                              border: "1px solid #E7E8F1",
                            }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <FieldLabel
                  icon={HiOutlineClipboardDocumentCheck}
                  text="Assessment Title"
                  required
                />
                <input
                  className="sf-input"
                  placeholder="e.g. Chapter 1 — React Basics Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel
                  icon={HiOutlineClock}
                  text="Duration (minutes)"
                  required
                />
                <div className="relative">
                  <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9498AB] pointer-events-none" />
                  <input
                    className="sf-input"
                    style={{ paddingLeft: 34 }}
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* questions */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="sf-display text-[14.5px] font-semibold text-[#0B1220] flex items-center gap-2">
                <HiOutlineQuestionMarkCircle className="w-[16px] h-[16px] text-[#7C3AED]" />
                Questions
                <span className="sf-mono text-[11.5px] text-[#9498AB] bg-[#F4F5FA] px-2 py-[2px] rounded-full">
                  {questions.length}
                </span>
              </p>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-[12.5px] font-semibold text-[#7C3AED] bg-[#F3EEFF] hover:bg-[#EDE1FF] transition-colors"
              >
                <HiOutlinePlusCircle className="w-[15px] h-[15px]" /> Add
                Question
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  className="border border-[#E7E8F1] rounded-xl overflow-hidden"
                >
                  {/* question header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFBFD] border-b border-[#F1F2F7]">
                    <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0">
                      <span className="sf-mono text-[10px] font-bold text-[#7C3AED]">
                        Q{qi + 1}
                      </span>
                    </div>
                    <span className="sf-display text-[13px] font-semibold text-[#0B1220] flex-1">
                      Question {qi + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      disabled={questions.length <= 1}
                      className="w-7 h-7 rounded-lg bg-[#FFF1F2] flex items-center justify-center hover:bg-[#FFE1E4] transition-colors disabled:opacity-30 shrink-0"
                    >
                      <HiOutlineXMark className="w-[13px] h-[13px] text-[#F43F5E]" />
                    </button>
                  </div>

                  <div className="px-4 py-4 flex flex-col gap-4">
                    {/* prompt */}
                    <div>
                      <FieldLabel
                        icon={HiOutlineQuestionMarkCircle}
                        text="Question Prompt"
                        required
                      />
                      <textarea
                        className="sf-input resize-none"
                        rows={2}
                        placeholder="Type your question here…"
                        value={q.prompt}
                        onChange={(e) =>
                          updateQ(qi, { prompt: e.target.value })
                        }
                      />
                    </div>

                    {/* options */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel text="Answer Options" required />
                        {q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qi)}
                            className="text-[11.5px] font-semibold text-[#7C3AED] hover:text-[#5B21B6] transition-colors flex items-center gap-1"
                          >
                            <HiOutlinePlusCircle className="w-[13px] h-[13px]" />{" "}
                            Add option
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {q.options.map((o, oi) => {
                          const isCorrect = Number(q.correctOptionIndex) === oi;
                          return (
                            <div
                              key={oi}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors
                              ${isCorrect ? "border-[#14B8A6] bg-[#F0FDF9]" : "border-[#E7E8F1] bg-[#FAFBFD]"}`}
                            >
                              {/* correct radio */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateQ(qi, { correctOptionIndex: oi })
                                }
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                  ${isCorrect ? "border-[#14B8A6] bg-[#14B8A6]" : "border-[#D1D5DB] bg-white hover:border-[#14B8A6]"}`}
                              >
                                {isCorrect && (
                                  <HiMiniCheck className="w-[11px] h-[11px] text-white" />
                                )}
                              </button>

                              {/* letter badge */}
                              <span
                                className={`sf-mono text-[11px] font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0
                                ${isCorrect ? "bg-[#14B8A6] text-white" : "bg-[#E7E8F1] text-[#6B7088]"}`}
                              >
                                {OPTION_LETTERS[oi] || oi + 1}
                              </span>

                              <input
                                className="flex-1 bg-transparent text-[13px] text-[#0B1220] outline-none placeholder:text-[#BABFC8]"
                                value={o.text}
                                placeholder={`Option ${OPTION_LETTERS[oi] || oi + 1}`}
                                onChange={(e) =>
                                  updateOpt(qi, oi, { text: e.target.value })
                                }
                              />

                              {isCorrect && (
                                <span className="text-[11px] font-semibold text-[#14B8A6] shrink-0">
                                  Correct
                                </span>
                              )}

                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qi, oi)}
                                  className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-[#FFE1E4] transition-colors shrink-0"
                                >
                                  <HiOutlineXMark className="w-[11px] h-[11px] text-[#F43F5E]" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[#9498AB] mt-2 flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-[11px] h-[11px] text-[#14B8A6]" />
                        Click the circle to mark the correct answer
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* save */}
            <div className="mt-4 pt-4 border-t border-[#F1F2F7]">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || loading}
                className="w-full flex items-center justify-center gap-2 py-[12px] rounded-xl text-[13.5px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <HiOutlineCheckCircle className="w-[16px] h-[16px]" />
                )}
                {loading ? "Saving…" : "Save Assessment"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: summary panel ────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* assessment summary */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <p className="sf-display text-[14px] font-semibold text-[#0B1220] mb-4">
              Summary
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-b border-[#F1F2F7]">
                <span className="text-[12.5px] text-[#6B7088]">Type</span>
                <span className="text-[12.5px] font-semibold text-[#0B1220] capitalize">
                  {assessmentType}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F2F7]">
                <span className="text-[12.5px] text-[#6B7088]">Questions</span>
                <span className="sf-mono text-[13px] font-semibold text-[#0B1220]">
                  {questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F2F7]">
                <span className="text-[12.5px] text-[#6B7088]">Duration</span>
                <span className="sf-mono text-[13px] font-semibold text-[#0B1220]">
                  {durationMinutes} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[12.5px] text-[#6B7088]">Status</span>
                <span className="text-[11.5px] font-semibold px-2 py-[3px] rounded-full bg-[#ECFDF9] text-[#0F766E]">
                  Publishes on save
                </span>
              </div>
            </div>
          </div>

          {/* question completeness */}
          <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12.5px] font-semibold text-[#3A3F55]">
                Question completeness
              </p>
              <span className="sf-mono text-[13px] font-semibold text-[#0B1220]">
                {completePct}%
              </span>
            </div>
            <div className="w-full h-[6px] bg-[#F1F2F7] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completePct}%`,
                  backgroundColor: completePct === 100 ? "#14B8A6" : "#7C3AED",
                }}
              />
            </div>
            <p className="text-[11.5px] text-[#9498AB] mt-2">
              {completePct === 100
                ? "All questions are complete ✓"
                : `${questions.filter((q) => !q.prompt?.trim() || q.options.some((o) => !o.text?.trim())).length} question${questions.filter((q) => !q.prompt?.trim() || q.options.some((o) => !o.text?.trim())).length !== 1 ? "s" : ""} need attention`}
            </p>
          </div>

          {/* tips */}
          <div className="bg-[#F3EEFF] rounded-2xl border border-[#E4D8FF] p-4">
            <p className="text-[12.5px] font-semibold text-[#5B21B6] mb-2">
              Tips
            </p>
            <ul className="flex flex-col gap-1.5">
              {[
                "Click the circle on any option to mark it correct",
                "You can add up to 6 options per question",
                "All options must be filled before saving",
              ].map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[12px] text-[#6B35CC]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-[5px] shrink-0" />{" "}
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
