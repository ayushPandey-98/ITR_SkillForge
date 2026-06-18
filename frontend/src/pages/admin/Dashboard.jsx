import React from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { serverUrl } from "../../App";

const shortCourseName = (title) => {
  const safeTitle = String(title || "Untitled");
  return safeTitle.length > 14 ? `${safeTitle.slice(0, 14)}...` : safeTitle;
};

function Dashboard() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const isAdmin = userData?.role === "admin";
  const isManager = userData?.role === "manager";
  const canManageLearning = isAdmin || isManager;

  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(canManageLearning);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!canManageLearning) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${serverUrl}/api/admin/courses`, {
          withCredentials: true,
        });

        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [canManageLearning]);

  const learningMaterialData = React.useMemo(
    () =>
      courses.map((course) => ({
        name: shortCourseName(course?.title),
        materials: course?.lectures?.length || 0,
      })),
    [courses]
  );

  const totalCourses = courses.length;
  const totalMaterials = courses.reduce(
    (sum, course) => sum + (course?.lectures?.length || 0),
    0
  );
  const publishedCourses = courses.filter((course) => course?.isPublished).length;
  const draftCourses = totalCourses - publishedCourses;

  const stats = canManageLearning
    ? [
        { label: "Courses", value: totalCourses },
        { label: "Learning Materials", value: totalMaterials },
        { label: "Published", value: publishedCourses },
        { label: "Drafts", value: draftCourses },
      ]
    : [
        { label: "Assigned Skills", value: "-" },
        { label: "Courses In Progress", value: "-" },
        { label: "Assessments", value: "-" },
        { label: "Badges Earned", value: "-" },
      ];

  const quickActions = [
    isAdmin && {
      label: "Manage Users",
      description: "Create Managers and Employees.",
      path: "/admin/users",
    },
    canManageLearning && {
      label: "Manage Courses",
      description: "Create and update internal learning paths.",
      path: "/admin/courses",
    },
    canManageLearning && {
      label: "Create Course",
      description: "Add PDFs, documents, videos, and learning materials.",
      path: "/admin/create-course",
    },
    !canManageLearning && {
      label: "My Courses",
      description: "Continue assigned learning materials.",
      path: "/enrolledcourses",
    },
    !canManageLearning && {
      label: "Skill Profile",
      description: "View progress, badges, and reports.",
      path: "/profile",
    },
  ].filter(Boolean);

  const responsibilities = isAdmin
    ? [
        "Create and manage Managers and Employees.",
        "Create skills, courses, quizzes, assignments, puzzles, and assessments.",
        "Assign courses and skills across the organization.",
        "Track progress, scores, badges, and reports.",
      ]
    : isManager
    ? [
        "Manage employees under your team.",
        "Create and assign courses, skills, quizzes, assignments, and assessments.",
        "Monitor team progress and performance.",
        "Manager accounts cannot create Admin or Manager users.",
      ]
    : [
        "View assigned skills and courses.",
        "Complete learning materials and assessments.",
        "Earn verified skill badges after passing assessments.",
        "Use failed attempts to trigger additional learning and retests.",
      ];

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          onClick={() => navigate("/")}
        >
          <FaArrowLeftLong className="h-4 w-4" />
          Home
        </button>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-gray-500">
                ITR SkillForge
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Welcome, {userData?.name || "User"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                Internal employee skill development, assessment, and badge
                tracking for ITRadiant.
              </p>
            </div>
            <span className="w-fit rounded-md border border-gray-300 px-3 py-1 text-sm font-medium capitalize text-gray-700">
              {userData?.role || "employee"}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="rounded-md border border-gray-200 p-4 text-left transition hover:border-black hover:bg-gray-50"
                  onClick={() => navigate(action.path)}
                >
                  <span className="block font-semibold text-gray-900">
                    {action.label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-gray-600">
                    {action.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Role Focus</h2>
            <div className="mt-4 space-y-3">
              {responsibilities.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-5 text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {canManageLearning ? (
          loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700 shadow-sm">
              Loading dashboard...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-white p-5 text-red-600 shadow-sm">
              {error}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700 shadow-sm">
              No internal courses found yet.
            </div>
          ) : (
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Learning Materials by Course
                </h2>
                <p className="text-sm text-gray-500">
                  Counts PDFs, documents, video links, and other materials added
                  as course lectures.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={learningMaterialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="materials" fill="#111827" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )
        ) : (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Learning Path</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Complete assigned course materials, take assessments, and earn
              verified skill badges. Failed assessments should guide you to
              additional learning before retesting.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
