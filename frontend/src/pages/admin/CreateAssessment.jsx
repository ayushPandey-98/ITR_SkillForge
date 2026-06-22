import axios from "axios";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
import { ClipLoader } from "react-spinners";

const emptyMcqOption = () => ({ text: "" });

const makeEmptyQuestion = () => ({
  type: "mcq",
  prompt: "",
  options: [emptyMcqOption(), emptyMcqOption(), emptyMcqOption(), emptyMcqOption()],
  correctOptionIndex: 0,
});

function CreateAssessment() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { userData } = useSelector((s) => s.user);

  const [loading, setLoading] = useState(false);

  const [assessmentType, setAssessmentType] = useState("quiz");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);

  const [questions, setQuestions] = useState([makeEmptyQuestion()]);

  const canSubmit = useMemo(() => {
    if (!courseId) return false;
    if (!title.trim()) return false;
    if (!durationMinutes || Number(durationMinutes) <= 0) return false;

    // simple validation
    for (const q of questions) {
      if (!q.prompt?.trim()) return false;
      if (q.type === "mcq") {
        if (!Array.isArray(q.options) || q.options.length < 2) return false;
        if (q.options.some((o) => !o.text?.trim())) return false;
      }
    }
    return true;
  }, [courseId, title, durationMinutes, questions]);

  const updateQuestion = (idx, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, oIdx, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)),
        };
      })
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, makeEmptyQuestion()]);

  const removeQuestion = (idx) => {
    setQuestions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const submit = async () => {
    if (!courseId) return toast.error("Missing courseId");
    if (!canSubmit) return toast.error("Please fill all fields correctly");

    setLoading(true);
    try {
      const payloadQuestions = questions.map((q) => ({
        type: q.type,
        prompt: q.prompt,
        options: (q.options || []).map((o) => ({ text: o.text })),
        correctOptionIndex: Number(q.correctOptionIndex) || 0,
      }));

      const res = await axios.post(
        `${serverUrl}/api/admin/courses/${courseId}/assessments`,
        {
          assessmentType,
          title,
          durationMinutes: Number(durationMinutes),
          questions: payloadQuestions,
          // optional
          isPublished: true,
        },
        { withCredentials: true }
      );

      toast.success(`${assessmentType.toUpperCase()} created`);

      // reset
      setTitle("");
      setDurationMinutes(15);
      setQuestions([makeEmptyQuestion()]);

      // stay on page
      console.log(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl w-full max-w-4xl p-6 mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Create Assignment / Quiz</h2>
          <p className="text-sm text-gray-500">MCQ, time-based test with duration.</p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          onClick={() => navigate(`/createlecture/${courseId}`)}
          disabled={!courseId}
        >
          Back to Lecture
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
          >
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="e.g. Chapter 1 - Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 border-t pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Questions (MCQ)</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="text-sm font-medium text-black hover:text-gray-700"
          >
            + Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm font-semibold text-gray-800">Question {qIdx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                  disabled={questions.length <= 1}
                >
                  Remove
                </button>
              </div>

              <label className="block text-xs font-medium text-gray-600 mb-1">Prompt</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
                value={q.prompt}
                placeholder="Type the question"
                onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Options</label>

                {q.options.map((o, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={Number(q.correctOptionIndex) === oIdx}
                      onChange={() => updateQuestion(qIdx, { correctOptionIndex: oIdx })}
                    />
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={o.text}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      onChange={(e) => updateOption(qIdx, oIdx, { text: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            className="flex-1 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            onClick={() => navigate(`/createlecture/${courseId}`)}
          >
            Back
          </button>

          <button
            type="button"
            className="flex-1 bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium shadow disabled:opacity-60"
            disabled={!canSubmit || loading}
            onClick={submit}
          >
            {loading ? <ClipLoader size={26} color="white" /> : "Save Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAssessment;

