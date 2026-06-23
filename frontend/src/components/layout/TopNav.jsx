import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
} from "lucide-react";

const roleStyle = {
  admin: {
    label: "Admin",
    color: "text-[#E8B14F] bg-[#E8B14F]/10 ring-[#E8B14F]/20",
  },
  manager: {
    label: "Manager",
    color: "text-[#9B8CFA] bg-[#9B8CFA]/10 ring-[#9B8CFA]/20",
  },
  employee: {
    label: "Employee",
    color: "text-[#38D2CA] bg-[#38D2CA]/10 ring-[#38D2CA]/20",
  },
};

export default function TopNav() {
  const { userData } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const role = userData?.role || "employee";
  const rs = roleStyle[role] || roleStyle.employee;

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="h-[52px] border-b border-[#1C2432] bg-[#0D1117] flex items-center justify-between px-4 sticky top-0 z-20 shrink-0">
      {/* ── Left: brand ── */}
      <div className="flex items-center gap-2">
        <div className="w-[26px] h-[26px] bg-[#38D2CA]/12 rounded-lg flex items-center justify-center">
          <GraduationCap size={12} className="text-[#38D2CA]" />
        </div>
        <span className="text-white font-semibold text-[12px]">SkillForge</span>
        <span className="text-[#2A3540] text-[11px] select-none">·</span>
        <span className="text-[#4B5563] text-[10px] hidden sm:block">
          ITRadiant LMS
        </span>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-1">
        {/* Role pill */}
        <span
          className={`hidden sm:inline-flex text-[9px] font-semibold px-2 py-[3px] rounded-full capitalize ring-1 ${rs.color}`}
        >
          {rs.label}
        </span>

        {/* Bell */}
        <button
          className="w-8 h-8 rounded-lg hover:bg-[#1C2432] text-[#4B5563] hover:text-[#9CA3AF] flex items-center justify-center transition"
          aria-label="Notifications"
        >
          <Bell size={14} />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#1C2432] transition"
          >
            <div className="w-[26px] h-[26px] rounded-full bg-[#38D2CA]/12 text-[#38D2CA] text-[10px] font-bold flex items-center justify-center ring-1 ring-[#38D2CA]/25">
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="text-[#C9D1D9] text-[11px] font-medium hidden sm:block max-w-[90px] truncate">
              {userData?.name || "User"}
            </span>
            <ChevronDown
              size={11}
              className={`text-[#4B5563] transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[160px] bg-[#161B22] border border-[#1C2432] rounded-xl shadow-xl overflow-hidden z-30">
              {/* Dropdown header */}
              <div className="px-3 py-2.5 border-b border-[#1C2432]">
                <p className="text-[11px] font-medium text-[#E5E7EB] truncate">
                  {userData?.name || "User"}
                </p>
                <p className="text-[9px] text-[#4B5563] mt-0.5 truncate">
                  {userData?.email || role}
                </p>
              </div>

              {/* Items */}
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#1C2432] hover:text-white transition text-left"
                >
                  <UserCircle size={13} />
                  <span className="text-[11px]">Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/settings");
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#1C2432] hover:text-white transition text-left"
                >
                  <Settings size={13} />
                  <span className="text-[11px]">Settings</span>
                </button>

                <div className="my-1 border-t border-[#1C2432]" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#6B7280] hover:bg-red-500/10 hover:text-red-400 transition text-left"
                >
                  <LogOut size={13} />
                  <span className="text-[11px]">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
