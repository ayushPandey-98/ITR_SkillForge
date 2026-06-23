import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Search, BookOpen, GraduationCap, Layers3 } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { serverUrl } from "../../App";
import { setCreatorCourseData } from "../../redux/courseSlice";
import Card from "../../components/Card";

function Courses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const { creatorCourseData } = useSelector((state) => state.course);

  const { userData } = useSelector((state) => state.user);

  const role = userData?.role;

  useEffect(() => {
    if (role === "employee") return;

    const load = async () => {
      try {
        const url =
          role === "admin"
            ? `${serverUrl}/api/admin/courses`
            : `${serverUrl}/api/course/getcreatorcourses`;

        const result = await axios.get(url, {
          withCredentials: true,
        });

        dispatch(setCreatorCourseData(result.data));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load courses");
      }
    };

    load();
  }, [dispatch, role]);

  const courses = useMemo(() => {
    if (role === "employee") {
      return Array.isArray(userData?.enrolledCourses)
        ? userData.enrolledCourses
        : [];
    }

    return Array.isArray(creatorCourseData) ? creatorCourseData : [];
  }, [creatorCourseData, role, userData?.enrolledCourses]);

  const filteredCourses = courses.filter(
    (course) =>
      course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      course?.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-11 h-11 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:border-[#7c3aed] transition"
        >
          <FaArrowLeftLong />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Library</h1>

          <p className="text-gray-500 mt-1">
            Explore and manage your learning journey
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Courses</p>

              <h2 className="text-3xl font-bold mt-1">{courses.length}</h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen className="text-[#7c3aed]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Categories</p>

              <h2 className="text-3xl font-bold mt-1">
                {new Set(courses.map((c) => c.category)).size}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Layers3 className="text-[#7c3aed]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Learning Tracks</p>

              <h2 className="text-3xl font-bold mt-1">{courses.length}</h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <GraduationCap className="text-[#7c3aed]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-2xl p-4 mb-8 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#7c3aed]"
          />
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/viewcourse/${course._id}`)}
              className="cursor-pointer hover:-translate-y-1 transition duration-300"
            >
              <Card
                thumbnail={course.thumbnail}
                title={course.title}
                category={course.category}
                level={course.level}
                materials={course.lectures?.length || 0}
                id={course._id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border p-12 text-center">
          <BookOpen size={60} className="mx-auto text-[#7c3aed]" />

          <h3 className="mt-5 text-xl font-semibold">No Courses Found</h3>

          <p className="text-gray-500 mt-2">
            Try searching with a different keyword.
          </p>
        </div>
      )}
    </div>
  );
}

export default Courses;
