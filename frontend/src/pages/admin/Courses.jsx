import React, { useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { serverUrl } from "../../App";
import { setCreatorCourseData } from "../../redux/courseSlice";
import { useMemo } from "react";
import Card from "../../components/Card";

function Courses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creatorCourseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);

  const role = userData?.role;

  useEffect(() => {
    // admin: all courses
    // manager: only creator courses
    // employee: show assigned courses from enrolledCourses
    if (role === "employee") return;

    const load = async () => {
      try {
        const url =
          role === "admin"
            ? serverUrl + "/api/admin/courses"
            : serverUrl + "/api/course/getcreatorcourses";

        const result = await axios.get(url, { withCredentials: true });
        dispatch(setCreatorCourseData(result.data));
      } catch (error) {
        console.log(error);
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center justify-center gap-3">
            <FaArrowLeftLong
              className="h-[22px] w-[22px] cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-semibold">Courses</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {courses.map((course) => (
            <div
              key={course?._id}
              className="cursor-pointer"
              onClick={() => navigate(`/viewcourse/${course?._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/viewcourse/${course?._id}`);
                }
              }}
            >
              <Card
                thumbnail={course?.thumbnail}
                title={course?.title}
                category={course?.category}
                level={course?.level}
                materials={course?.lectures?.length || 0}
                id={course?._id}
              />
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="mt-10 text-center text-sm text-gray-500">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
