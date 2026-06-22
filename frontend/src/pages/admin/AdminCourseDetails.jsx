import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import { serverUrl } from "../../App";

export default function AdminCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${serverUrl}/api/admin/courses/${courseId}`,
          { withCredentials: true }
        );
        setCourse(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load course" );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  const lecturesCount = useMemo(() => (course?.lectures?.length || 0), [course]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-col sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/admin/courses")}
            />
            <div>
              <h1 className="text-xl font-semibold">Course Details</h1>
              <div className="text-sm text-gray-500">{course?.isPublished ? "Published" : "Draft"}</div>
            </div>
          </div>

          <button
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            onClick={() => navigate(`/addcourses/${courseId}`)}
          >
            Add Lectures
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : !course ? (
          <div className="text-sm text-gray-600">No course found.</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-[280px] w-full">
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={course?.thumbnail || ""}
                    alt=""
                    className="w-full h-[180px] object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">{course?.title}</div>
                <div className="mt-2 text-sm text-gray-600">
                  Creator: {course?.creator?.name || "-"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs border border-gray-200 bg-white">
                    {lecturesCount} materials
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs border border-gray-200 bg-white">
                    Status: {course?.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {course?.description || ""}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lectures</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course?.lectures || []).map((lec, idx) => (
                  <div key={lec?._id || idx} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="font-medium text-gray-900">{lec?.title || `Lecture ${idx + 1}`}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {lec?.type ? `Type: ${lec.type}` : ""}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 break-all">
                      {lec?.contentUrl || lec?.url || ""}
                    </div>
                  </div>
                ))}

                {lecturesCount === 0 && (
                  <div className="text-sm text-gray-600">No lectures found.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

