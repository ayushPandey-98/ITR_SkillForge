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
    label: "Course Mgmt",
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

const roleStyle = {
  admin: { label: "Admin", color: "text-[#E8B14F] bg-[#E8B14F]/10" },
  manager: { label: "Manager", color: "text-[#9B8CFA] bg-[#9B8CFA]/10" },
  employee: { label: "Employee", color: "text-[#38D2CA] bg-[#38D2CA]/10" },
};

function clsx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RbacSidebar({ collapsed, setCollapsed }) {
  const { userData } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const role = userData?.role || "employee";
  const items = navItems.filter((item) => item.roles.includes(role));
  const rs = roleStyle[role] || roleStyle.employee;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col flex-shrink-0",
        "bg-[#0D1117] border-r border-[#1C2432]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[58px]" : "w-[192px]",
      )}
    >
      {/* ── Header ── */}
      <div
        className={clsx(
          "h-[52px] border-b border-[#1C2432] flex items-center shrink-0",
          collapsed ? "justify-center px-0" : "justify-between px-3",
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-[#38D2CA]/12 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap size={14} className="text-[#38D2CA]" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-[12px] leading-none truncate">
                  SkillForge
                </p>
                <p className="text-[#4B5563] text-[10px] mt-[3px]">
                  ITRadiant LMS
                </p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-6 h-6 rounded-md hover:bg-[#1C2432] text-[#4B5563] hover:text-[#9CA3AF] flex items-center justify-center transition shrink-0"
            >
              <ChevronLeft size={13} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 rounded-md hover:bg-[#1C2432] text-[#4B5563] hover:text-[#9CA3AF] flex items-center justify-center transition"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── User ── */}
      <div
        className={clsx(
          "py-3 border-b border-[#1C2432] shrink-0",
          collapsed ? "flex justify-center px-0" : "px-3",
        )}
      >
        <div
          className={clsx(
            "flex items-center",
            collapsed ? "justify-center" : "gap-2",
          )}
        >
          {/* Avatar */}
          <div className="w-[30px] h-[30px] rounded-full bg-[#38D2CA]/12 text-[#38D2CA] text-[11px] font-bold flex items-center justify-center shrink-0 ring-1 ring-[#38D2CA]/20">
            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[#E5E7EB] text-[11px] font-medium truncate leading-none">
                {userData?.name || "User"}
              </p>
              <span
                className={clsx(
                  "inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1 capitalize",
                  rs.color,
                )}
              >
                {rs.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-1.5 overflow-y-auto space-y-0.5">
        {items.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "w-full relative rounded-[8px] transition-all duration-150",
                "flex items-center outline-none",
                collapsed ? "justify-center h-9" : "gap-2.5 px-2.5 py-[7px]",
                active
                  ? "bg-[#38D2CA]/10 text-[#38D2CA]"
                  : "text-[#6B7280] hover:bg-[#1C2432] hover:text-[#D1D5DB]",
              )}
            >
              {/* Active left-bar indicator */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#38D2CA] rounded-full" />
              )}

              <Icon size={15} className="shrink-0" />
              {!collapsed && (
                <span className="text-[11px] font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="p-1.5 border-t border-[#1C2432] shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={clsx(
            "w-full rounded-[8px] transition-all duration-150",
            "text-[#4B5563] hover:bg-red-500/10 hover:text-red-400",
            collapsed
              ? "h-9 flex justify-center items-center"
              : "px-2.5 py-[7px] flex items-center gap-2.5",
          )}
        >
          <LogOut size={14} />
          {!collapsed && (
            <span className="text-[11px] font-medium">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
