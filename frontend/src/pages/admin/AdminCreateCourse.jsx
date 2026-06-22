import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
// import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  HiOutlineBookOpen,
  HiOutlineTag,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlineGlobeAlt,
  HiOutlineCheckCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

const CATEGORIES = [
  "App Development",
  "AI/ML",
  "AI Tools",
  "Data Science",
  "Data Analytics",
  "Ethical Hacking",
  "UI UX Designing",
  "Web Development",
  "Others",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function Label({ icon: Icon, text, required }) {
  return (
    <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3A3F55] mb-1.5">
      <Icon className="w-[14px] h-[14px] text-[#9498AB]" />
      {text}
      {required && <span className="text-[#F43F5E]">*</span>}
    </label>
  );
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#9498AB] pointer-events-none" />
      )}
      <input
        className={`w-full bg-[#F8F9FC] border border-[#E7E8F1] rounded-xl text-[13.5px] text-[#0B1220] placeholder:text-[#BABFC8]
          focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all py-[11px]
          ${Icon ? "pl-9 pr-3" : "px-3"}`}
        {...props}
      />
    </div>
  );
}

function Select({ icon: Icon, options, placeholder, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#9498AB] pointer-events-none z-10" />
      )}
      <select
        className={`w-full bg-[#F8F9FC] border border-[#E7E8F1] rounded-xl text-[13.5px] text-[#0B1220]
          focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all py-[11px] appearance-none
          ${Icon ? "pl-9 pr-8" : "px-3 pr-8"}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9498AB] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-[#7C3AED]" : "bg-[#D1D5DB]"}`}
      >
        <div
          className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
      <span className="text-[13.5px] font-medium text-[#3A3F55]">{label}</span>
    </button>
  );
}

export default function AdminCreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const { userData } = useSelector((s) => s.user);
  const isAdmin = userData?.role === "admin";
  const fileRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    creator: "",
    subTitle: "",
    description: "",
    level: "",
    isPublished: false,
    thumbnail: null,
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const r = await axios.get(serverUrl + "/api/admin/users", {
            withCredentials: true,
          });
          setUsers(r.data);
        } else if (userData?._id) {
          setUsers([userData]);
          set("creator", userData._id);
        }
        if (courseId) {
          const r = await axios.get(
            serverUrl + `/api/admin/courses/${courseId}`,
            { withCredentials: true },
          );
          const c = r.data;
          setForm({
            title: c.title || "",
            category: c.category || "",
            creator: c.creator?._id || c.creator || "",
            subTitle: c.subTitle || "",
            description: c.description || "",
            level: c.level || "",
            isPublished: Boolean(c.isPublished),
            thumbnail: null,
          });
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load");
      }
    };
    load();
  }, [courseId, isAdmin, userData]);

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    set("thumbnail", f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.creator) {
      toast.error("Title, category, and creator are required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("creator", form.creator);
      fd.append("subTitle", form.subTitle || "");
      fd.append("description", form.description || "");
      fd.append("level", form.level || "");
      fd.append("isPublished", form.isPublished);
      if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

      const cfg = {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      };
      if (isEdit) {
        await axios.patch(
          serverUrl + `/api/admin/courses/${courseId}`,
          fd,
          cfg,
        );
        toast.success("Course updated");
      } else {
        await axios.post(serverUrl + "/api/admin/courses", fd, cfg);
        toast.success("Course created");
      }
      navigate("/admin/courses");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const completeness = [
    form.title,
    form.category,
    form.creator,
    form.level,
    form.description,
  ].filter(Boolean).length;
  const pct = Math.round((completeness / 5) * 100);

  return (
    <div
      role="admin"
      title={isEdit ? "Edit Course" : "Create Course"}
      subtitle={
        isEdit
          ? "Update this course's details and settings"
          : "Fill in the details to add a new course to the library"
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');
        .sf-display { font-family: 'Space Grotesk', sans-serif; }
        .sf-mono    { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── left two-thirds: fields ───────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* basic info card */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-6">
              <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-5 flex items-center gap-2">
                <HiOutlineBookOpen className="w-[18px] h-[18px] text-[#7C3AED]" />{" "}
                Basic Information
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <Label
                    icon={HiOutlineBookOpen}
                    text="Course Title"
                    required
                  />
                  <Input
                    icon={HiOutlineBookOpen}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Advanced React Patterns"
                  />
                </div>
                <div>
                  <Label icon={HiOutlineDocumentText} text="Sub Title" />
                  <Input
                    icon={HiOutlineDocumentText}
                    value={form.subTitle}
                    onChange={(e) => set("subTitle", e.target.value)}
                    placeholder="A short, punchy description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label icon={HiOutlineTag} text="Category" required />
                    <Select
                      icon={HiOutlineTag}
                      options={CATEGORIES}
                      placeholder="Select category"
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label icon={HiOutlineAcademicCap} text="Skill Level" />
                    <Select
                      icon={HiOutlineAcademicCap}
                      options={LEVELS}
                      placeholder="Select level"
                      value={form.level}
                      onChange={(e) => set("level", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label icon={HiOutlineUserCircle} text="Creator" required />
                  <div className="relative">
                    <HiOutlineUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#9498AB] pointer-events-none z-10" />
                    <select
                      value={form.creator}
                      onChange={(e) => set("creator", e.target.value)}
                      className="w-full bg-[#F8F9FC] border border-[#E7E8F1] rounded-xl text-[13.5px] text-[#0B1220] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all py-[11px] pl-9 pr-8 appearance-none"
                    >
                      <option value="">Select creator</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9498AB] pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* description card */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-6">
              <p className="sf-display text-[15px] font-semibold text-[#0B1220] mb-5 flex items-center gap-2">
                <HiOutlineDocumentText className="w-[18px] h-[18px] text-[#7C3AED]" />{" "}
                Description
              </p>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What will employees learn? What skills does this course build?"
                rows={5}
                className="w-full bg-[#F8F9FC] border border-[#E7E8F1] rounded-xl text-[13.5px] text-[#0B1220] placeholder:text-[#BABFC8]
                  focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all px-4 py-3 resize-none"
              />
            </div>
          </div>

          {/* ── right one-third: image + settings ─────────── */}
          <div className="flex flex-col gap-4">
            {/* image upload */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <p className="sf-display text-[14px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
                <HiOutlinePhoto className="w-[16px] h-[16px] text-[#7C3AED]" />{" "}
                Course Thumbnail
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      set("thumbnail", null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <HiOutlineXMark className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#7C3AED] hover:bg-[#F3EEFF] transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F3EEFF] flex items-center justify-center">
                    <HiOutlineCloudArrowUp className="w-[20px] h-[20px] text-[#7C3AED]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-[#3A3F55]">
                      Click to upload image
                    </p>
                    <p className="text-[11.5px] text-[#9498AB] mt-0.5">
                      PNG, JPG, WEBP
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* settings */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <p className="sf-display text-[14px] font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
                <HiOutlineGlobeAlt className="w-[16px] h-[16px] text-[#7C3AED]" />{" "}
                Settings
              </p>
              <div className="flex flex-col gap-4">
                <Toggle
                  checked={form.isPublished}
                  onChange={(v) => set("isPublished", v)}
                  label={
                    form.isPublished
                      ? "Published"
                      : "Draft — not visible to employees"
                  }
                />
                {form.isPublished && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ECFDF9]">
                    <HiOutlineCheckCircle className="w-4 h-4 text-[#14B8A6] shrink-0" />
                    <p className="text-[12px] text-[#0F766E]">
                      This course will be visible and assignable once saved.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* completeness */}
            <div className="bg-white rounded-2xl border border-[#E7E8F1] p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12.5px] font-semibold text-[#3A3F55]">
                  Form completeness
                </p>
                <span className="sf-mono text-[13px] font-semibold text-[#0B1220]">
                  {pct}%
                </span>
              </div>
              <div className="w-full h-[6px] bg-[#F1F2F7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? "#14B8A6" : "#7C3AED",
                  }}
                />
              </div>
              <p className="text-[11.5px] text-[#9498AB] mt-2">
                {pct < 100
                  ? `${5 - completeness} required field${5 - completeness !== 1 ? "s" : ""} remaining`
                  : "All required fields complete"}
              </p>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-[13px] rounded-xl text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="w-[17px] h-[17px]" />{" "}
                    {isEdit ? "Update Course" : "Create Course"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/courses")}
                disabled={loading}
                className="w-full py-[12px] rounded-xl text-[14px] font-medium text-[#6B7088] border border-[#E7E8F1] hover:bg-[#F4F5FA] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
