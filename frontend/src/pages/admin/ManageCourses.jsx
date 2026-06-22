import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  HiOutlinePlusCircle,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineUserPlus,
  HiOutlineBookOpen,
  HiOutlineTrash,
  HiOutlineListBullet,
  HiOutlineRectangleStack,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
} from "react-icons/hi2";

const STATUS_MAP = {
  true: { label: "Published", bg: "#ECFDF9", color: "#0F766E" },
  false: { label: "Draft", bg: "#FFF6E8", color: "#B45309" },
};

function ActionBtn({ label, icon: Icon, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ color, backgroundColor: `${color}14` }}
      className="flex items-center gap-1 px-[10px] py-[5px] rounded-lg text-[11.5px] font-medium transition-all disabled:opacity-40 hover:brightness-90 active:scale-95"
    >
      <Icon className="w-[13px] h-[13px] shrink-0" /> {label}
    </button>
  );
}

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilter] = useState("all");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(serverUrl + "/api/admin/courses", {
        withCredentials: true,
      });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const removeCourse = async (courseId, title) => {
    if (!window.confirm(`Remove "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await axios.delete(serverUrl + `/api/admin/courses/${courseId}`, {
        withCredentials: true,
      });
      toast.success("Course removed");
      fetchCourses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  const published = courses.filter((c) => c.isPublished).length;
  const draft = courses.length - published;

  const filtered = courses.filter((c) => {
    const q = `${c.title} ${c.creator?.name} ${c.category}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const s =
      filterStatus === "all" ||
      (filterStatus === "published" ? c.isPublished : !c.isPublished);
    return q && s;
  });

  return (
    <div
      role="admin"
      title="Course Library"
      subtitle="Create, edit, assign, and manage all learning courses"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        .sf-display { font-family: 'Space Grotesk', sans-serif; }
        .sf-mono    { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Courses",
            value: courses.length,
            icon: HiOutlineRectangleStack,
            color: "#7C3AED",
          },
          {
            label: "Published",
            value: published,
            icon: HiOutlineCheckCircle,
            color: "#14B8A6",
          },
          {
            label: "Drafts",
            value: draft,
            icon: HiOutlineNoSymbol,
            color: "#F59E0B",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#E7E8F1] px-5 py-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="sf-mono text-[22px] font-semibold text-[#0B1220] leading-none">
                {s.value}
              </p>
              <p className="text-[12px] text-[#8A8FA3] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── main card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E7E8F1] overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F2F7]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F4F5FA] border border-[#E7E8F1] rounded-xl px-3 py-[8px] min-w-[220px]">
              <HiOutlineMagnifyingGlass className="w-[16px] h-[16px] text-[#9498AB] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, creator, category…"
                className="bg-transparent outline-none text-[13px] w-full placeholder:text-[#9498AB]"
              />
            </div>
            {["all", "published", "draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-[7px] rounded-xl text-[12.5px] font-medium capitalize transition-colors
                  ${filterStatus === f ? "bg-[#0B1220] text-white" : "text-[#6B7088] hover:bg-[#F4F5FA]"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/admin/create-course")}
            className="flex items-center gap-2 px-4 py-[10px] rounded-xl text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors shadow-sm"
          >
            <HiOutlinePlusCircle className="w-[17px] h-[17px]" /> Add Course
          </button>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px]">
            <thead>
              <tr className="border-b border-[#F1F2F7] bg-[#FAFBFD]">
                {[
                  "Course",
                  "Category",
                  "Creator",
                  "Materials",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-[11px] px-4 text-left text-[11px] font-semibold text-[#9498AB] tracking-[0.06em] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[13px] text-[#9498AB]">
                        Loading courses…
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((c) => {
                  const st = STATUS_MAP[String(c.isPublished)];
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-[#F1F2F7] last:border-0 hover:bg-[#FAFBFD] transition-colors"
                    >
                      <td className="py-[14px] px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] flex items-center justify-center shrink-0">
                            <HiOutlineBookOpen className="w-[17px] h-[17px] text-[#7C3AED]" />
                          </div>
                          <div>
                            <p className="text-[13.5px] font-semibold text-[#0B1220] max-w-[200px] truncate leading-tight">
                              {c.title}
                            </p>
                            {c.level && (
                              <p className="text-[11.5px] text-[#9498AB] mt-0.5">
                                {c.level}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-[14px] px-4 text-[12.5px] text-[#6B7088]">
                        {c.category || "—"}
                      </td>
                      <td className="py-[14px] px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E7E8F1] flex items-center justify-center text-[10px] font-semibold text-[#3A3F55]">
                            {c.creator?.name?.slice(0, 1).toUpperCase() || "?"}
                          </div>
                          <span className="text-[12.5px] text-[#6B7088]">
                            {c.creator?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-[14px] px-4">
                        <span className="sf-mono text-[12.5px] font-medium text-[#0B1220]">
                          {c.lectures?.length || 0}
                        </span>
                        <span className="text-[11.5px] text-[#9498AB] ml-1">
                          lec.
                        </span>
                      </td>
                      <td className="py-[14px] px-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-[5px] rounded-full"
                          style={{ color: st.color, backgroundColor: st.bg }}
                        >
                          {c.isPublished ? (
                            <HiOutlineCheckCircle className="w-[12px] h-[12px]" />
                          ) : (
                            <HiOutlineNoSymbol className="w-[12px] h-[12px]" />
                          )}
                          {st.label}
                        </span>
                      </td>
                      <td className="py-[14px] px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <ActionBtn
                            label="Edit"
                            icon={HiOutlinePencilSquare}
                            color="#0EA5E9"
                            onClick={() =>
                              navigate(`/admin/edit-course/${c._id}`)
                            }
                            disabled={loading}
                          />
                          <ActionBtn
                            label="Assign"
                            icon={HiOutlineUserPlus}
                            color="#14B8A6"
                            onClick={() =>
                              navigate(`/admin/assign-course/${c._id}`)
                            }
                            disabled={loading}
                          />
                          <ActionBtn
                            label="Content"
                            icon={HiOutlineListBullet}
                            color="#7C3AED"
                            onClick={() => navigate(`/createcontent/${c._id}`)}
                            disabled={loading}
                          />
                          <ActionBtn
                            label="Delete"
                            icon={HiOutlineTrash}
                            color="#F43F5E"
                            onClick={() => removeCourse(c._id, c.title)}
                            disabled={loading}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] flex items-center justify-center">
                        <HiOutlineBookOpen className="w-7 h-7 text-[#7C3AED]" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#0B1220]">
                        No courses found
                      </p>
                      <p className="text-[13px] text-[#9498AB]">
                        Try a different filter or add a new course
                      </p>
                      <button
                        onClick={() => navigate("/admin/create-course")}
                        className="mt-1 flex items-center gap-2 px-4 py-[10px] rounded-xl text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors"
                      >
                        <HiOutlinePlusCircle className="w-[16px] h-[16px]" />{" "}
                        Add First Course
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer row */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F1F2F7] flex items-center justify-between">
            <p className="text-[12.5px] text-[#9498AB]">
              Showing{" "}
              <span className="font-semibold text-[#0B1220]">
                {filtered.length}
              </span>{" "}
              of {courses.length} courses
            </p>
            <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B7088] hover:text-[#0B1220] transition-colors">
              <HiOutlineArrowDownTray className="w-[15px] h-[15px]" /> Export
              CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
