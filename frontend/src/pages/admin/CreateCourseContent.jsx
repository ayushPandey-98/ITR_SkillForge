import React, { useState } from "react";
import CreateLecture from "./CreateLecture";
import CreateAssessment from "./CreateAssessment";

function CreateCourseContent() {
  const [activeTab, setActiveTab] = useState("lecture");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-gray-800">
            Course Content
          </h1>
          <p className="text-sm text-gray-500">
            Manage lectures/materials and assignments/quizzes separately.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("lecture")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                activeTab === "lecture"
                  ? "bg-black text-white border-black"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Lecture & Material
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("assessment")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                activeTab === "assessment"
                  ? "bg-black text-white border-black"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Assignment & Quiz
            </button>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "lecture" ? (
            <CreateLecture />
          ) : (
            <CreateAssessment />
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourseContent;

