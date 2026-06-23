import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import RbacSidebar from "../role/RbacSidebar";
import TopNav from "./TopNav";

export default function DashboardLayout({ children }) {
  const { userData } = useSelector((state) => state.user);

  const role = userData?.role;

  const showSidebar = useMemo(() => Boolean(role), [role]);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[#f8fafc]">
      {showSidebar && (
        <RbacSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

