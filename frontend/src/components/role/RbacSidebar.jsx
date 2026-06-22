import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Users,
  UserCircle,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "employee"],
  },
  {
    key: "courses",
    label: "Course Library",
    path: "/courses",
    icon: BookOpen,
    roles: ["admin", "manager", "employee"],
  },
  {
    key: "admin_courses",
    label: "Course Management",
    path: "/admin/courses",
    icon: FolderKanban,
    roles: ["admin", "manager"],
  },
  {
    key: "admin_users",
    label: "Users",
    path: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    key: "profile",
    label: "Profile",
    path: "/profile",
    icon: UserCircle,
    roles: ["admin", "manager", "employee"],
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["admin"],
  },
];

function clsx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RbacSidebar({
  collapsed,
  setCollapsed,
}) {
  const { userData } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();

  const role = userData?.role || "employee";

  const items = navItems.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col",
        "bg-gradient-to-b from-[#7c3aed] to-[#6d28d9]",
        "border-r border-white/10",
        "shadow-2xl",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="h-20 border-b border-white/10 px-4 flex items-center justify-between">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow">
                <GraduationCap
                  size={22}
                  className="text-[#7c3aed]"
                />
              </div>

              <div>
                <h2 className="text-white font-bold text-xl leading-none">
                  SkillForge
                </h2>

                <p className="text-white/70 text-xs mt-1">
                  ITRadiant LMS
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setCollapsed(!collapsed)
              }
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow">
              <GraduationCap
                size={22}
                className="text-[#7c3aed]"
              />
            </div>

            <button
              onClick={() =>
                setCollapsed(!collapsed)
              }
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-5 border-b border-white/10">
        <div
          className={clsx(
            "flex items-center",
            collapsed
              ? "justify-center"
              : "gap-3"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-white text-[#7c3aed] font-bold flex items-center justify-center shadow">
            {userData?.name?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>

          {!collapsed && (
            <div>
              <h4 className="font-semibold text-white">
                {userData?.name || "User"}
              </h4>

              <p className="text-sm text-white/70 capitalize">
                {role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {items.map((item) => {
          const active =
            location.pathname === item.path;

          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() =>
                navigate(item.path)
              }
              className={clsx(
                "w-full rounded-2xl transition-all duration-200 mb-2",
                "flex items-center",
                collapsed
                  ? "justify-center h-14"
                  : "gap-4 px-4 py-3",
                active
                  ? "bg-white text-[#7c3aed] shadow-lg"
                  : "text-white hover:bg-white/10"
              )}
            >
              <Icon
                size={22}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="font-medium">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={clsx(
            "w-full rounded-2xl",
            "bg-white/10 hover:bg-red-500",
            "transition-all duration-300",
            "text-white",
            collapsed
              ? "h-14 flex justify-center items-center"
              : "px-4 py-3 flex items-center gap-3"
          )}
        >
          <LogOut size={20} />

          {!collapsed && (
            <span className="font-medium">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}