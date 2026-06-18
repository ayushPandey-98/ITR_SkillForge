import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./pages/ForgotPassword";
import { useSelector } from "react-redux";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Dashboard from "./pages/admin/Dashboard";
import Courses from "./pages/admin/Courses";
import AllCouses from "./pages/AllCouses";
import AddCourses from "./pages/admin/AddCourses";
import CreateCourse from "./pages/admin/CreateCourse";
import CreateLecture from "./pages/admin/CreateLecture";
import EditLecture from "./pages/admin/EditLecture";
import Users from "./pages/admin/Users";
import ManageCourses from "./pages/admin/ManageCourses";
import AdminCreateCourse from "./pages/admin/AdminCreateCourse";
import AssignCourseToEmployees from "./pages/admin/AssignCourseToEmployees.jsx";



import getCouseData from "./customHooks/getCouseData";

import ViewCourse from "./pages/ViewCourse";
import ScrollToTop from "./components/ScrollToTop";
import getCreatorCourseData from "./customHooks/getCreatorCourseData";
import EnrolledCourse from "./pages/EnrolledCourse";
import ViewLecture from "./pages/ViewLecture";
import SearchWithAi from "./pages/SearchWithAi";
import getAllReviews from "./customHooks/getAllReviews";
import AuthGate from "./auth/AuthGate";
import LoginRedirect from "./auth/LoginRedirect";

export const serverUrl = "http://localhost:8000";

function App() {
  let { userData } = useSelector((state) => state.user);
  const isAdmin = userData?.role === "admin";
  const isManager = userData?.role === "manager";
  const canManageCourses = isAdmin || isManager;

  getCouseData();
  getCreatorCourseData();
  getAllReviews();

  return (
    <AuthGate>
      <>
        <ToastContainer />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <LoginRedirect>
                <Login />
              </LoginRedirect>
            }
          />
          <Route
            path="/signup"
            element={!userData ? <SignUp /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={userData ? <Profile /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/allcourses"
            element={
              userData ? <AllCouses /> : <Navigate to="/signup" replace />
            }
          />
          <Route
            path="/viewcourse/:courseId"
            element={
              userData ? <ViewCourse /> : <Navigate to="/signup" replace />
            }
          />
          <Route
            path="/editprofile"
            element={
              userData ? <EditProfile /> : <Navigate to="/signup" replace />
            }
          />
          <Route
            path="/enrolledcourses"
            element={
              userData ? <EnrolledCourse /> : <Navigate to="/signup" replace />
            }
          />
          <Route
            path="/viewlecture/:courseId"
            element={
              userData ? <ViewLecture /> : <Navigate to="/signup" replace />
            }
          />
          <Route
            path="/searchwithai"
            element={
              userData ? <SearchWithAi /> : <Navigate to="/signup" replace />
            }
          />

          <Route
            path="/dashboard"
            element={
              userData ? (
                <Dashboard />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />

          <Route
            path="/courses"
            element={
              canManageCourses ? (
                <Courses />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/addcourses/:courseId"
            element={
              canManageCourses ? (
                <AddCourses />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/createcourses"
            element={
              canManageCourses ? (
                <CreateCourse />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/createlecture/:courseId"
            element={
              canManageCourses ? (
                <CreateLecture />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/editlecture/:courseId/:lectureId"
            element={
              canManageCourses ? (
                <EditLecture />
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route path="/admin/users" element={isAdmin ? <Users /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/courses" element={canManageCourses ? <ManageCourses /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/create-course" element={canManageCourses ? <AdminCreateCourse /> : <Navigate to="/dashboard" replace />} />
          <Route
            path="/admin/edit-course/:courseId"
            element={
              canManageCourses ? (
                <AdminCreateCourse />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/admin/assign-course/:courseId"
            element={isAdmin ? <AssignCourseToEmployees /> : <Navigate to="/dashboard" replace />}
          />

          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>

      </>
    </AuthGate>
  );
}

export default App;
