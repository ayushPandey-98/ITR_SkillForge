import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(serverUrl + "/api/admin/courses", {
        withCredentials: true,
      });
      setCourses(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const removeCourse = async (courseId) => {
    const ok = window.confirm("Remove this course?");
    if (!ok) return;

    setLoading(true);
    try {
      await axios.delete(serverUrl + `/api/admin/courses/${courseId}`, {
        withCredentials: true,
      });
      toast.success("Course removed");
      await fetchCourses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-col sm:flex-row">
          <div className="flex items-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-semibold">Manage Courses</h1>
          </div>

          <button
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            onClick={() => navigate("/admin/create-course")}
          >
            Add Course
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Creator</th>
                <th className="text-left py-3 px-4">Materials</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">{c.title}</td>
                  <td className="py-3 px-4">{c.creator?.name || "-"}</td>
                  <td className="py-3 px-4">{c.lectures?.length || 0}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        c.isPublished ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                      }`}
                    >
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="mr-4 text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/admin/edit-course/${c._id}`)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeCourse(c._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td className="py-10 px-4 text-center text-gray-500" colSpan={5}>
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageCourses;

