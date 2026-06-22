import React from "react";
import { useSelector } from "react-redux";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-semibold">Reports</h1>
          </div>
          <span className="text-sm px-3 py-1 rounded-md border border-gray-200 text-gray-700">
            Admin View
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {["Learning Overview", "Assessments Summary", "Badges & Progress"].map((t) => (
            <div key={t} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">{t}</div>
              <div className="mt-2 text-sm text-gray-600">
                This UI is ready for report metrics. Hook it with backend APIs to
                show real data.
              </div>
              <div className="mt-4 h-2 w-2/3 bg-black/10 rounded-full" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Recent Activity</div>
              <div className="text-sm text-gray-600">
                Signed in as {userData?.name || "Admin"}
              </div>
            </div>
            <button
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              onClick={() => navigate("/admin/courses")}
            >
              Go to Manage Courses
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Event</th>
                  <th className="text-left py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: "Today", event: "Course created", role: "Manager" },
                  { time: "Yesterday", event: "Users assigned", role: "Admin" },
                  { time: "2 days ago", event: "Lecture added", role: "Manager" },
                ].map((row) => (
                  <tr key={row.time + row.event} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-700">{row.time}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{row.event}</td>
                    <td className="py-3 px-4 text-gray-600">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

