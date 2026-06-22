import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
// import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineBookOpen,
  HiOutlineCheckCircle, HiOutlineUserPlus, HiMiniCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function AssignCourseToEmployees() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [loading, setLoading]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [course, setCourse]               = useState(null);
  const [employees, setEmployees]         = useState([]);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [query, setQuery]                 = useState("");

  const selectedSet = useMemo(
    () => new Set(selectedIds.map(String)),
    [selectedIds]
  );

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [empRes, courseRes] = await Promise.all([
          axios.get(`${serverUrl}/api/admin/employees`,        { withCredentials: true }),
          axios.get(`${serverUrl}/api/admin/courses/${courseId}`, { withCredentials: true }),
        ]);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setCourse(courseRes.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load data");
      } finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const toggle = (id) => {
    const sid = String(id);
    setSelectedIds(prev => {
      const s = new Set(prev.map(String));
      s.has(sid) ? s.delete(sid) : s.add(sid);
      return Array.from(s);
    });
  };

  const filtered = employees.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(u => selectedSet.has(String(u._id)));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.some(u => String(u._id) === String(id))));
    } else {
      const newIds = filtered.map(u => String(u._id));
      setSelectedIds(prev => Array.from(new Set([...prev.map(String), ...newIds])));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!courseId)           { toast.error("Missing course ID"); return; }
    if (!selectedIds.length) { toast.error("Select at least one employee"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${serverUrl}/api/admin/assign-course`,
        { courseId, employeeIds: selectedIds },
        { withCredentials: true }
      );
      toast.success(`Course assigned to ${selectedIds.length} employee${selectedIds.length > 1 ? "s" : ""}`);
      navigate("/admin/courses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign");
    } finally { setSubmitting(false); }
  };

  return (
    <div role="admin" title="Assign Course" subtitle="Select employees to give them immediate access to this course">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .sf-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── left: employee selector ───────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E8F1] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F2F7] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HiOutlineUserGroup className="w-[18px] h-[18px] text-[#7C3AED]" />
                <span className="font-semibold text-[15px] text-[#0B1220] sf-display">
                  Select Employees
                </span>
                <span className="text-[12px] text-[#9498AB] ml-1">
                  ({employees.length} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#F4F5FA] border border-[#E7E8F1] rounded-xl px-3 py-[8px]">
                  <HiOutlineMagnifyingGlass className="w-[15px] h-[15px] text-[#9498AB] shrink-0" />
                  <input
                    value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="bg-transparent outline-none text-[13px] w-[180px] placeholder:text-[#9498AB]"
                  />
                </div>
                {filtered.length > 0 && (
                  <button type="button" onClick={toggleAll}
                    className={`px-3 py-[8px] rounded-xl text-[12.5px] font-medium transition-colors
                      ${allSelected
                        ? "bg-[#0B1220] text-white"
                        : "border border-[#E7E8F1] text-[#6B7088] hover:bg-[#F4F5FA]"}`}>
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="py-14 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px] text-[#9498AB]">Loading employees…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2">
                  <HiOutlineUserGroup className="w-10 h-10 text-[#C3C6D4]" />
                  <p className="text-[13px] text-[#9498AB]">No employees match "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filtered.map(u => {
                    const sel = selectedSet.has(String(u._id));
                    return (
                      <button
                        type="button"
                        key={u._id}
                        onClick={() => toggle(u._id)}
                        className={`flex items-center gap-3 text-left p-3 rounded-xl border transition-all
                          ${sel
                            ? "border-[#7C3AED] bg-[#F3EEFF]"
                            : "border-[#E7E8F1] hover:border-[#C8CBDA] hover:bg-[#FAFBFD]"}`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-white transition-colors
                            ${sel ? "bg-[#7C3AED]" : "bg-[#8A8FA3]"}`}>
                            {u.name?.slice(0,1).toUpperCase()}
                          </div>
                          {sel && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#7C3AED] border-2 border-white flex items-center justify-center">
                              <HiMiniCheck className="w-[9px] h-[9px] text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-semibold leading-tight truncate ${sel ? "text-[#5B21B6]" : "text-[#0B1220]"}`}>{u.name}</p>
                          <p className="text-[11.5px] text-[#9498AB] truncate mt-0.5">{u.email}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                          ${sel ? "bg-[#7C3AED] border-[#7C3AED]" : "border-[#D1D5DB]"}`}>
                          {sel && <HiMiniCheck className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── right: course info + confirm ───────────────── */}
          <div className="flex flex-col gap-4">
            {/* course card */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <p className="text-[11.5px] font-semibold text-[#9498AB] uppercase tracking-wider mb-3">Course</p>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F3EEFF] flex items-center justify-center shrink-0">
                  <HiOutlineBookOpen className="w-[22px] h-[22px] text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#0B1220] leading-snug">
                    {course?.title || "Loading…"}
                  </p>
                  {course?.category && (
                    <span className="inline-flex mt-1 text-[11.5px] font-medium px-2 py-[3px] rounded-full bg-[#F3EEFF] text-[#7C3AED]">
                      {course.category}
                    </span>
                  )}
                  {course?.level && (
                    <p className="text-[12px] text-[#9498AB] mt-1">{course.level}</p>
                  )}
                </div>
              </div>
            </div>

            {/* selection summary */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <p className="text-[11.5px] font-semibold text-[#9498AB] uppercase tracking-wider mb-3">Selection</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] flex items-center justify-center">
                    <HiOutlineUserPlus className="w-[18px] h-[18px] text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[22px] font-semibold text-[#0B1220] leading-none" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {selectedIds.length}
                    </p>
                    <p className="text-[12px] text-[#9498AB]">selected</p>
                  </div>
                </div>
                {selectedIds.length > 0 && (
                  <button type="button" onClick={() => setSelectedIds([])}
                    className="flex items-center gap-1 text-[12px] text-[#F43F5E] hover:text-[#BE123C] transition-colors">
                    <HiOutlineXMark className="w-4 h-4" /> Clear
                  </button>
                )}
              </div>

              {/* selected avatars preview */}
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedIds.slice(0, 8).map(id => {
                    const emp = employees.find(u => String(u._id) === String(id));
                    if (!emp) return null;
                    return (
                      <div key={id} title={emp.name}
                        className="w-7 h-7 rounded-full bg-[#7C3AED] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                        {emp.name?.slice(0,1).toUpperCase()}
                      </div>
                    );
                  })}
                  {selectedIds.length > 8 && (
                    <div className="w-7 h-7 rounded-full bg-[#E7E8F1] text-[#6B7088] text-[10px] font-semibold flex items-center justify-center border-2 border-white">
                      +{selectedIds.length - 8}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button type="submit" disabled={submitting || selectedIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-[12px] rounded-xl text-[13.5px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assigning…</>
                  ) : (
                    <><HiOutlineCheckCircle className="w-[17px] h-[17px]" />
                      Assign to {selectedIds.length > 0 ? selectedIds.length : "..."} employee{selectedIds.length !== 1 ? "s" : ""}</>
                  )}
                </button>
                <button type="button" onClick={() => navigate("/admin/courses")} disabled={submitting}
                  className="w-full py-[11px] rounded-xl text-[13.5px] font-medium text-[#6B7088] border border-[#E7E8F1] hover:bg-[#F4F5FA] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}