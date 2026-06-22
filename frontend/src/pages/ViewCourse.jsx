import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaLock, FaPlayCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import img from "../assets/empty.jpg";
import Card from "../components/Card.jsx";

function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);
  const [creatorData, setCreatorData] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const selectedCourseData = useMemo(
    () => courseData.find((item) => item._id === courseId),
    [courseData, courseId],
  );

  const assignedCourseIds = useMemo(
    () =>
      (userData?.enrolledCourses || []).map((course) =>
        typeof course === "string" ? course : course?._id,
      ),
    [userData?.enrolledCourses],
  );

  const isAssigned = assignedCourseIds.some(
    (assignedId) => assignedId?.toString() === courseId?.toString(),
  );
  const canManageLearning = ["admin", "manager"].includes(userData?.role);

  const relatedCourses = useMemo(() => {
    if (!creatorData?._id) return [];
    return courseData.filter(
      (course) =>
        course.creator === creatorData._id &&
        course._id !== courseId &&
        course.isPublished,
    );
  }, [creatorData?._id, courseData, courseId]);

  useEffect(() => {
    const getCreator = async () => {
      const creatorId =
        selectedCourseData?.creator?._id || selectedCourseData?.creator;

      if (!creatorId) return;

      try {
        const result = await axios.post(
          `${serverUrl}/api/course/getcreator`,
          { userId: creatorId },
          { withCredentials: true },
        );
        setCreatorData(result.data);
      } catch (error) {
        console.error("Error fetching facilitator:", error);
      }
    };

    getCreator();
  }, [selectedCourseData]);

  const handleStartLearning = () => {
    if (isAssigned || canManageLearning) {
      navigate(`/viewlecture/${courseId}`);
      return;
    }

    toast.info("Ask your Manager or Admin to assign this course to you.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6 rounded-xl bg-white p-4 shadow-md sm:p-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          onClick={() => navigate("/")}
        >
          <FaArrowLeftLong className="h-4 w-4" />
          Home
        </button>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              src={selectedCourseData?.thumbnail || img}
              alt={selectedCourseData?.title || "Course"}
              className="h-full max-h-[360px] w-full rounded-lg object-cover"
            />
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase text-gray-500">
                Internal Skill Course
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {selectedCourseData?.title || "Course"}
              </h1>
              <p className="mt-2 text-gray-600">
                {selectedCourseData?.subTitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
                {selectedCourseData?.category || "Skill"}
              </span>
              {selectedCourseData?.level && (
                <span className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
                  {selectedCourseData.level}
                </span>
              )}
              <span className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
                {selectedCourseData?.lectures?.length || 0} learning materials
              </span>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                Complete assigned PDFs, documents, videos, and learning links.
              </li>
              <li>
                Take quizzes, assignments, puzzles, and course assessments.
              </li>
              <li>Earn a verified skill badge after passing the assessment.</li>
              <li>
                Failed assessments trigger more learning and a retest path.
              </li>
            </ul>

            <button
              className="w-fit rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
              onClick={handleStartLearning}
            >
              {isAssigned || canManageLearning
                ? "Start Learning"
                : "Request Assignment"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Course Overview
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              {selectedCourseData?.description ||
                `This course helps employees build and validate practical ${selectedCourseData?.category || "skill"} knowledge within ITRadiant.`}
            </p>

            <h3 className="mt-6 text-lg font-semibold text-gray-900">
              What You Will Validate
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-gray-700">
              <li>
                Core concepts and practical understanding of the skill area.
              </li>
              <li>Applied knowledge through assignments and puzzles.</li>
              <li>Assessment readiness for earning an internal skill badge.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Facilitator</h2>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={creatorData?.photoUrl || img}
                alt={creatorData?.name || "Facilitator"}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {creatorData?.name || "-"}
                </h3>
                <p className="text-sm capitalize text-gray-600">
                  {creatorData?.role || "manager"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">{creatorData?.email}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 p-5 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800">
              Learning Materials
            </h2>
            <p className="mb-4 mt-1 text-sm text-gray-500">
              {selectedCourseData?.lectures?.length || 0} chapters / items
              available
            </p>

            <div className="flex flex-col gap-3">
              {selectedCourseData?.lectures?.map((lecture, index) => (
                <button
                  key={lecture?._id || index}
                  disabled={!lecture.isPreviewFree}
                  onClick={() =>
                    lecture.isPreviewFree && setSelectedLecture(lecture)
                  }
                  className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                    lecture.isPreviewFree
                      ? "border-gray-300 hover:bg-gray-100"
                      : "cursor-not-allowed border-gray-200 opacity-60"
                  } ${
                    selectedLecture?.lectureTitle === lecture.lectureTitle
                      ? "border-gray-400 bg-gray-100"
                      : ""
                  }`}
                >
                  <span className="text-gray-700">
                    {lecture.isPreviewFree ? <FaPlayCircle /> : <FaLock />}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {lecture.lectureTitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-5 md:col-span-3">
            <div className="mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black">
              {(() => {
                const firstMaterial = selectedLecture?.materials?.[0];
                if (!firstMaterial) {
                  return (
                    <span className="text-sm text-white">
                      Select an available learning material to preview
                    </span>
                  );
                }

                if (firstMaterial.type === "video" && firstMaterial.fileUrl) {
                  return (
                    <video
                      src={firstMaterial.fileUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  );
                }

                if (
                  firstMaterial.type === "videoLink" &&
                  firstMaterial.videoLink
                ) {
                  return (
                    <div className="p-4 text-center">
                      <p className="text-sm text-white mb-2">Video link</p>
                      <a
                        className="underline text-white break-all"
                        href={firstMaterial.videoLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {firstMaterial.videoLink}
                      </a>
                    </div>
                  );
                }

                if (firstMaterial.type === "pdf" && firstMaterial.fileUrl) {
                  return (
                    <div className="p-4 text-center">
                      <p className="text-sm text-white mb-2">PDF available</p>
                      <a
                        className="underline text-white break-all"
                        href={firstMaterial.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open PDF
                      </a>
                    </div>
                  );
                }

                return (
                  <span className="text-sm text-white">
                    No preview available
                  </span>
                );
              })()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedLecture?.lectureTitle || "Learning Material"}
            </h3>
            <p className="text-sm text-gray-600">{selectedCourseData?.title}</p>
          </div>
        </section>

        {relatedCourses.length > 0 && (
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900">
              More Courses from this Facilitator
            </h2>
            <div className="flex flex-wrap gap-6 py-5">
              {relatedCourses.map((item) => (
                <Card
                  key={item._id}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  id={item._id}
                  category={item.category}
                  level={item.level}
                  materials={item.lectures?.length || 0}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ViewCourse;
