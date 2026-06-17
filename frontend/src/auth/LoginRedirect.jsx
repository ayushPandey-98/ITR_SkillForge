import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LoginRedirect({ children }) {
  const { userData } = useSelector((state) => state.user);
  if (userData) return <Navigate to="/" replace />;
  return children;
}

