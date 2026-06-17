import React from 'react'
import axios from 'axios'
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import img from "../../assets/empty.jpg"; // fallback photo
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from "react-icons/fa6";
import { serverUrl } from '../../App';
function Dashboard() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [adminCourses, setAdminCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchAdminCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // admin-only endpoint
        const res = await axios.get(`${serverUrl}/api/admin/courses`, {
          withCredentials: true,
        });

        setAdminCourses(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminCourses();
  }, []);

  const courseProgressData = React.useMemo(() => {
    return (adminCourses || []).map((course) => ({
      name: (course?.title || 'Untitled').slice(0, 10) + ((course?.title || '').length > 10 ? '...' : ''),
      lectures: course?.lectures?.length || 0,
      reviews: course?.reviews?.length || 0,
    }));
  }, [adminCourses]);

  const enrollmentData = React.useMemo(() => {
    // enrolledStudents might not be populated/available from /api/admin/courses.
    // So we derive a safe metric that always exists: reviews count.
    return (adminCourses || []).map((course) => ({
      name: (course?.title || 'Untitled').slice(0, 10) + ((course?.title || '').length > 10 ? '...' : ''),
      reviews: course?.reviews?.length || 0,
    }));
  }, [adminCourses]);

  const totalCourses = adminCourses?.length || 0;
  const totalLectures = (adminCourses || []).reduce((sum, c) => sum + (c?.lectures?.length || 0), 0);
  const totalReviews = (adminCourses || []).reduce((sum, c) => sum + (c?.reviews?.length || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <FaArrowLeftLong className=' w-[22px] absolute top-[10%] left-[10%] h-[22px] cursor-pointer' onClick={() => navigate("/")} />
      <div className="w-full px-6 py-10   bg-gray-50 space-y-10">
        {/* Welcome Section */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={userData?.photoUrl || img}
            alt="Educator"
            className="w-28 h-28 rounded-full object-cover border-4 border-black shadow-md"
          />
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {userData?.name || "Admin"} 👋
            </h1>
            <h1 className='text-xl font-semibold text-gray-800'>Total Courses : <span className='font-light text-gray-900'>{totalCourses}</span></h1>
            <p className="text-gray-600 text-sm">
              Lectures: {totalLectures} • Reviews: {totalReviews}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <h1
                className='px-[10px] text-center  py-[10px] border-2  bg-black border-black text-white  rounded-[10px] text-[15px] font-light flex items-center justify-center gap-2 cursor-pointer'
                onClick={() => navigate("/admin/courses")}
              >
                Manage Courses
              </h1>
              <h1
                className='px-[10px] text-center  py-[10px] border-2  bg-white border-black text-black rounded-[10px] text-[15px] font-light flex items-center justify-center gap-2 cursor-pointer'
                onClick={() => navigate("/admin/users")}
              >
                Manage Users
              </h1>
            </div>
          </div>
        </div>

        {/* Graphs Section */}
        {loading ? (
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 text-gray-700">Loading dashboard...</div>
        ) : error ? (
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 text-red-600">{error}</div>
        ) : adminCourses.length === 0 ? (
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 text-gray-700">No courses found for analytics.</div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lectures Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Course Progress (Lectures)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="lectures" fill="black" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Reviews Chart (safe metric) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Course Reviews</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reviews" fill="black" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard

