import React, { useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { serverUrl } from "../../App";
import { setCreatorCourseData } from "../../redux/courseSlice";
import img1 from "../../assets/empty.jpg";

function Courses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creatorCourseData } = useSelector((state) => state.course);

  useEffect(() => {
    const getCreatorData = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/course/getcreatorcourses", {
          withCredentials: true,
        });

        dispatch(setCreatorCourseData(result.data));
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to load courses");
      }
    };

    getCreatorData();
  }, [dispatch]);

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

          <button
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-500"
            onClick={() => navigate("/createcourses")}
          >
            Create Course
          </button>
        </div>

        <div className="hidden overflow-x-auto rounded-xl bg-white p-4 shadow md:block">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Materials</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {creatorCourseData?.map((course) => (
                <tr
                  key={course?._id}
                  className="border-b transition duration-200 hover:bg-gray-50"
                >
                  <td className="flex items-center gap-4 px-4 py-3">
                    <img
                      src={course?.thumbnail || img1}
                      alt={course?.title || "Course"}
                      className="h-14 w-20 rounded-md object-cover"
                    />
                    <span>{course?.title}</span>
                  </td>
                  <td className="px-4 py-3">{course?.lectures?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        course?.isPublished
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {course?.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="mr-3 rounded bg-black px-3 py-1 text-xs text-white hover:bg-gray-700"
                      onClick={() => navigate(`/addcourses/${course?._id}`)}
                    >
                      Add Lectures
                    </button>
                    <FaEdit
                      className="cursor-pointer text-gray-600 hover:text-blue-600"
                      onClick={() => navigate(`/addcourses/${course?._id}`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-center text-sm text-gray-400">
            A list of your internal learning courses.
          </p>
        </div>

        <div className="space-y-4 md:hidden">
          {creatorCourseData?.map((course) => (
            <div key={course?._id} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow">
              <div className="flex items-center gap-4">
                <img
                  src={course?.thumbnail || img1}
                  alt={course?.title || "Course"}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-sm font-medium">{course?.title}</h2>
                  <p className="mt-1 text-xs text-gray-600">
                    {course?.lectures?.length || 0} materials
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded bg-black px-3 py-1 text-xs text-white hover:bg-gray-700"
                    onClick={() => navigate(`/addcourses/${course?._id}`)}
                  >
                    Add Lectures
                  </button>
                  <FaEdit
                    className="cursor-pointer text-gray-600 hover:text-blue-600"
                    onClick={() => navigate(`/addcourses/${course?._id}`)}
                  />
                </div>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs ${
                  course?.isPublished
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {course?.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          ))}
          <p className="mt-4 text-center text-sm text-gray-400">
            A list of your internal learning courses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Courses;
