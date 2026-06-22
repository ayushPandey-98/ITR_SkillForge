import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import {
  HiOutlineSquares2X2,
  HiArrowRight,
  HiOutlineInboxArrowDown,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineTrophy,
  HiOutlineShieldCheck,
  HiOutlineRocketLaunch,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

// ── Content blocks — copy lives here so the page stays self-contained ──
const STATS = [
  { value: "2,842", label: "Employees growing" },
  { value: "412", label: "Skills tracked" },
  { value: "1,096", label: "Badges earned" },
  { value: "86", label: "Courses live" },
];

const JOURNEY = [
  {
    icon: HiOutlineInboxArrowDown,
    title: "Get assigned",
    desc: "An admin or manager assigns a skill, course, or assessment to you.",
  },
  {
    icon: HiOutlineBookOpen,
    title: "Learn at your pace",
    desc: "Work through PDFs, documents, and videos built for the skill.",
  },
  {
    icon: HiOutlineClipboardDocumentCheck,
    title: "Get assessed",
    desc: "Prove it with a quiz, assignment, or puzzle tied to the course.",
  },
  {
    icon: HiOutlineTrophy,
    title: "Earn the badge",
    desc: "Pass and it's added to your profile. Miss it, and you get extra material plus a retest.",
  },
];

const ROLES = [
  {
    key: "employee",
    accent: "#14B8A6",
    soft: "#ECFDF9",
    icon: HiOutlineSparkles,
    title: "Employee",
    tag: "Learn & validate",
    points: [
      "View assigned skills and courses",
      "Work through learning material at your pace",
      "Take quizzes, assignments, and assessments",
      "Earn verified badges and track your profile",
    ],
  },
  {
    key: "manager",
    accent: "#F59E0B",
    soft: "#FFF6E8",
    icon: HiOutlineUserGroup,
    title: "Manager",
    tag: "Guide your team",
    points: [
      "Manage the employees on your team",
      "Assign courses, skills, and assessments",
      "Build quizzes and assignments for your team",
      "Monitor progress and performance in real time",
    ],
  },
  {
    key: "admin",
    accent: "#7C3AED",
    soft: "#F3EEFF",
    icon: HiOutlineUsers,
    title: "Admin",
    tag: "Run the platform",
    points: [
      "Create and manage managers and employees",
      "Build the skill library and course catalog",
      "Design quizzes, assignments, and assessments",
      "Track org-wide progress, badges, and reports",
    ],
  },
];

const VALUES = [
  {
    icon: HiOutlineShieldCheck,
    title: "Verified, not vague",
    desc: "Badges are only earned by passing a real assessment — never handed out for showing up.",
  },
  {
    icon: HiOutlineRocketLaunch,
    title: "Built to keep growing",
    desc: "A failed assessment isn\u2019t a dead end. It triggers more material and a retest.",
  },
  {
    icon: HiOutlineEye,
    title: "Visibility for leaders",
    desc: "Managers and admins see real progress, scores, and gaps as they happen — not at review time.",
  },
  {
    icon: HiOutlineCheckBadge,
    title: "One home for skills",
    desc: "Courses, assessments, badges, and reports live in a single profile for every employee.",
  },
];

function Home() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className="w-full overflow-hidden sf-font-body"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        .sf-font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-num { font-family: 'JetBrains Mono', monospace; }
        @keyframes sf-travel { 0%, 100% { left: 1%; } 50% { left: 97%; } }
        .sf-spark { animation: sf-travel 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sf-spark { animation: none; left: 50%; } }
      `}</style>

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative bg-[#0B1220] pt-[110px] pb-20 px-5 sm:px-8">
        {/* ambient glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#14B8A6]/10 blur-[120px] pointer-events-none" />

        <Nav />

        <div className="relative max-w-[820px] mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#14B8A6] bg-[#14B8A6]/10 border border-[#14B8A6]/25 rounded-full px-3 py-[6px]">
            <HiOutlineSparkles className="w-[14px] h-[14px]" /> ITRadiant
            internal platform
          </span>

          <h1 className="sf-font-display text-white font-semibold text-[34px] sm:text-[48px] lg:text-[58px] leading-[1.08] mt-5">
            Forge your skills.
            <br />
            Shape your career.
          </h1>

          <p className="text-white/60 text-[15px] sm:text-[17px] max-w-[560px] mx-auto mt-5 leading-relaxed">
            ITR SkillForge is where ITRadiant employees learn, get assessed, and
            earn verified badges — one skill at a time.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button
              className="flex items-center gap-2 px-6 py-[13px] rounded-xl text-[14.5px] font-semibold text-[#0B1220] bg-[#14B8A6] hover:bg-[#0F9E8E] transition-colors"
              onClick={() => navigate(userData ? "/dashboard" : "/login")}
            >
              <HiOutlineSquares2X2 className="w-[18px] h-[18px]" />
              {userData ? "Open my dashboard" : "Get started"}
            </button>
            <button
              className="flex items-center gap-2 px-6 py-[13px] rounded-xl text-[14.5px] font-medium text-white border border-white/15 hover:border-white/35 transition-colors"
              onClick={() => scrollTo("how-it-works")}
            >
              See how it works <HiArrowRight className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Signature: the skill journey path */}
          <div className="relative w-full max-w-[640px] mx-auto mt-16">
            <div className="relative h-[2px] bg-white/10 rounded-full mx-[4%]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#14B8A6] via-[#F59E0B] to-[#7C3AED] opacity-40" />
              <div className="sf-spark absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#FB923C] shadow-[0_0_18px_5px_rgba(251,146,60,0.55)]" />
            </div>
            <div className="flex justify-between mt-5">
              {JOURNEY.map((j) => (
                <div
                  key={j.title}
                  className="flex flex-col items-center gap-2 w-1/4 px-1"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                    <j.icon className="w-[18px] h-[18px] text-white/70" />
                  </div>
                  <span className="text-white/50 text-[11px] sm:text-[12px] text-center leading-tight">
                    {j.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Stats ───────────────────────── */}
      <section className="bg-white px-5 sm:px-8 -mt-px">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 py-10">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="text-center border-r border-[#EFEFF5] last:border-r-0"
            >
              <p className="font-mono-num text-[26px] sm:text-[32px] font-semibold text-[#0B1220]">
                {s.value}
              </p>
              <p className="text-[12px] sm:text-[13px] text-[#8A8FA3] mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section id="how-it-works" className="bg-[#F8F9FC] px-5 sm:px-8 py-20">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center max-w-[520px] mx-auto mb-14">
            <span className="text-[12px] font-semibold text-[#14B8A6] tracking-wide uppercase">
              How it works
            </span>
            <h2 className="sf-font-display text-[#0B1220] font-semibold text-[26px] sm:text-[34px] mt-2">
              Four steps from assigned to badged
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {JOURNEY.map((j, i) => (
              <div
                key={j.title}
                className="bg-white rounded-2xl border border-[#E7E8F1] p-6 relative"
              >
                <span className="font-mono-num text-[12px] text-[#C3C6D4]">
                  0{i + 1}
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#ECFDF9] flex items-center justify-center mt-3 mb-4">
                  <j.icon className="w-[22px] h-[22px] text-[#0F766E]" />
                </div>
                <p className="text-[15px] font-semibold text-[#0B1220]">
                  {j.title}
                </p>
                <p className="text-[13px] text-[#8A8FA3] mt-2 leading-relaxed">
                  {j.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Roles ───────────────────────── */}
      <section id="roles" className="bg-white px-5 sm:px-8 py-20">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-14">
            <span className="text-[12px] font-semibold text-[#7C3AED] tracking-wide uppercase">
              Built around your role
            </span>
            <h2 className="sf-font-display text-[#0B1220] font-semibold text-[26px] sm:text-[34px] mt-2">
              One platform, three ways to use it
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className="rounded-2xl border border-[#E7E8F1] p-7 flex flex-col"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: r.soft }}
                >
                  <r.icon
                    className="w-[24px] h-[24px]"
                    style={{ color: r.accent }}
                  />
                </div>
                <span
                  className="text-[12px] font-semibold uppercase tracking-wide"
                  style={{ color: r.accent }}
                >
                  {r.tag}
                </span>
                <p className="sf-font-display text-[20px] font-semibold text-[#0B1220] mt-1 mb-4">
                  {r.title}
                </p>
                <ul className="flex flex-col gap-3 mb-6 flex-1">
                  {r.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-[13px] text-[#52566B] leading-snug"
                    >
                      <span
                        className="w-[6px] h-[6px] rounded-full mt-[6px] shrink-0"
                        style={{ backgroundColor: r.accent }}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  className="flex items-center justify-center gap-2 w-full py-[11px] rounded-xl text-[13.5px] font-semibold border transition-colors"
                  style={{ color: r.accent, borderColor: `${r.accent}40` }}
                  onClick={() => navigate(userData ? "/dashboard" : "/login")}
                >
                  View {r.title.toLowerCase()} dashboard{" "}
                  <HiArrowRight className="w-[15px] h-[15px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Why it matters ───────────────────────── */}
      <section className="bg-[#0B1220] px-5 sm:px-8 py-20">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center max-w-[520px] mx-auto mb-14">
            <span className="text-[12px] font-semibold text-[#14B8A6] tracking-wide uppercase">
              Why it matters
            </span>
            <h2 className="sf-font-display text-white font-semibold text-[26px] sm:text-[34px] mt-2">
              Skills you can actually point to
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
              >
                <v.icon className="w-[24px] h-[24px] text-[#14B8A6] mb-4" />
                <p className="text-[14.5px] font-semibold text-white">
                  {v.title}
                </p>
                <p className="text-[13px] text-white/55 mt-2 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="bg-[#0B1220] border-t border-white/10 px-5 sm:px-8 py-8">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#14B8A6] to-[#0B1220] border border-[#14B8A6]/50 flex items-center justify-center">
              <span className="sf-font-display font-bold text-[11px] text-[#14B8A6]">
                SF
              </span>
            </div>
            <span className="sf-font-display text-white text-[13.5px] font-medium">
              ITR SkillForge
            </span>
          </div>
          <p className="text-white/40 text-[12px] text-center">
            Internal employee platform · ITRadiant · not for external
            distribution
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
