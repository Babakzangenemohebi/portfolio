"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronDown, Sparkles, Video, LayoutGrid, Brain, Settings2
} from "lucide-react";
import gsap from "gsap";

import AntiGravityBackground from "@/components/AntiGravityBackground";
import Navbar from "@/components/Navbar";
import PortfolioGrid from "@/components/PortfolioGrid";
import ResumeTimeline from "@/components/ResumeTimeline";
import ContactForm from "@/components/ContactForm";
import AdminModal from "@/components/AdminModal";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [nameHovered, setNameHovered] = useState(false);

  // Central state managed by our database-backed hook
  const {
    projects, categories, settings, timeline, initialized, token, setAdminToken,
    addProject, deleteProject, toggleVisibility, toggleFeatured, updateProject,
    addCategory, deleteCategory, updateSettings,
    addTimelineItem, updateTimelineItem, deleteTimelineItem, resetToDefaults,
  } = usePortfolioStore();

  // ── Refs for parallax ──
  const heroSectionRef   = useRef<HTMLElement>(null);
  const profileImageRef  = useRef<HTMLDivElement>(null);
  const profileGlowRef   = useRef<HTMLDivElement>(null);
  const rafRef           = useRef<number>(0);
  const mousePos         = useRef({ x: 0, y: 0 });

  // ── Refs for name hover vector animation ──
  const pathRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const handleLRef = useRef<SVGLineElement>(null);
  const handleRRef = useRef<SVGLineElement>(null);
  const handleDotLRef = useRef<SVGCircleElement>(null);
  const handleDotRRef = useRef<SVGCircleElement>(null);

  // ── Hero GSAP entrance ──
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(".hero-badge",  { opacity: 0, scale: 0.8, y: -20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" });
    tl.fromTo(".hero-title",  { opacity: 0, y: 40 },              { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.5");
    tl.fromTo(".hero-desc",   { opacity: 0, y: 30 },              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");
    tl.fromTo(".hero-buttons",{ opacity: 0, y: 20 },              { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");
    tl.fromTo(".hero-floating-widget", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "elastic.out(1,0.75)" }, "-=0.4");

    // Idle float animations
    gsap.to(".floating-widget-1", { y: -15, x:  10, rotation:  5, duration: 4,   repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".floating-widget-2", { y:  15, x:  -8, rotation: -6, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5 });
    gsap.to(".floating-widget-3", { y: -10, x: -12, rotation:  8, duration: 5,   repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
  }, []);

  // ── Name Vector Path Drawing Animation ──
  useEffect(() => {
    if (nameHovered) {
      gsap.fromTo(pathRef.current, 
        { strokeDashoffset: 400 },
        { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }
      );
      
      const penObj = { t: 0 };
      gsap.fromTo(penObj, 
        { t: 0 },
        { 
          t: 1, 
          duration: 1.2, 
          ease: "power2.out",
          onUpdate: () => {
            const t = penObj.t;
            const x = (1-t)*(1-t)*50 + 2*(1-t)*t*200 + t*t*350;
            const y = (1-t)*(1-t)*80 + 2*(1-t)*t*0 + t*t*80;
            if (penRef.current) {
              penRef.current.style.transform = `translate(${x}px, ${y}px)`;
            }
          }
        }
      );

      gsap.fromTo([handleLRef.current, handleRRef.current, handleDotLRef.current, handleDotRRef.current],
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.3, ease: "back.out(1.5)" }
      );
    } else {
      gsap.to(pathRef.current, { strokeDashoffset: 400, duration: 0.4 });
      gsap.to([handleLRef.current, handleRRef.current, handleDotLRef.current, handleDotRRef.current], { opacity: 0, duration: 0.3 });
      if (penRef.current) {
        gsap.to(penRef.current, { transform: "translate(50px, 80px)", duration: 0.4 });
      }
    }
  }, [nameHovered]);

  // ── Mouse-move Parallax ──
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!heroSectionRef.current) return;
    const rect  = heroSectionRef.current.getBoundingClientRect();
    const relX  = (e.clientX - rect.left)  / rect.width  - 0.5;
    const relY  = (e.clientY - rect.top)   / rect.height - 0.5;
    mousePos.current = { x: relX, y: relY };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      gsap.to(profileGlowRef.current, {
        x: relX * 60,
        y: relY * 60,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.to(profileImageRef.current, {
        x: relX * -20,
        y: relY * -20,
        rotateY: relX *  8,
        rotateX: relY * -8,
        duration: 0.8,
        ease: "power2.out",
        transformPerspective: 1000,
      });
    });
  }, []);

  useEffect(() => {
    const section = heroSectionRef.current;
    if (!section) return;
    section.addEventListener("mousemove", handleMouseMove);
    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    gsap.to(profileGlowRef.current,  { x: 0, y: 0, duration: 1, ease: "power3.out" });
    gsap.to(profileImageRef.current, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 1, ease: "power3.out" });
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <>
      {/* Canvas Background */}
      <AntiGravityBackground />

      {/* Navbar */}
      <Navbar />

      {/* ── Floating Admin Button ── */}
      <button
        id="admin-toggle-btn"
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-8 left-8 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl glass-nav border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-brand-orange/40 hover:bg-brand-orange/5 shadow-xl transition-all duration-300 group cursor-pointer"
        title="پنل مدیریت"
      >
        <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500 text-brand-orange" />
        <span className="text-xs font-bold">مدیریت سایت</span>
      </button>

      {/* Admin Panel Modal */}
      {adminOpen && initialized && (
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          projects={projects}
          categories={categories}
          settings={settings}
          timeline={timeline}
          token={token}
          onSetToken={setAdminToken}
          onDeleteProject={deleteProject}
          onToggleVisibility={toggleVisibility}
          onToggleFeatured={toggleFeatured}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onUpdateSettings={updateSettings}
          onAddTimelineItem={addTimelineItem}
          onUpdateTimelineItem={updateTimelineItem}
          onDeleteTimelineItem={deleteTimelineItem}
          onReset={resetToDefaults}
        />
      )}

      <main className="w-full min-h-screen flex flex-col items-center">

        {/* ──────────── HERO ──────────── */}
        <section
          id="home"
          ref={heroSectionRef}
          onMouseLeave={handleMouseLeave}
          className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12 overflow-hidden"
        >
          {/* Decorative far glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-orange/5 blur-3xl -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-teal/5 blur-3xl -z-10" />

          {/* Floating Widget 1 */}
          <div className="hero-floating-widget floating-widget-1 hidden lg:flex absolute left-[8%] top-[30%] p-4 rounded-2xl glass items-center gap-3 shadow-lg max-w-[190px] text-right pointer-events-none">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-orange/15 text-brand-orange">
              <Video className="w-4 h-4" />
            </span>
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold">تدوین و ویدیو</span>
              <span className="text-xs font-semibold text-zinc-300">تدوین سینماتیک تیزر</span>
            </div>
          </div>

          {/* Floating Widget 2 */}
          <div className="hero-floating-widget floating-widget-2 hidden lg:flex absolute right-[7%] top-[38%] p-4 rounded-2xl glass items-center gap-3 shadow-lg max-w-[200px] text-right pointer-events-none">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold">طراحی گرافیک</span>
              <span className="text-xs font-semibold text-zinc-300">ست هویت بصری چاپ</span>
            </div>
          </div>

          {/* Floating Widget 3 */}
          <div className="hero-floating-widget floating-widget-3 hidden lg:flex absolute left-[10%] bottom-[22%] p-4 rounded-2xl glass items-center gap-3 shadow-lg max-w-[190px] text-right pointer-events-none">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-800 text-white">
              <Brain className="w-4 h-4 text-purple-400" />
            </span>
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold">خلاقیت نوین</span>
              <span className="text-xs font-semibold text-zinc-300">ادغام هوش مصنوعی</span>
            </div>
          </div>

          {/* ── Two-Column Hero Grid ── */}
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-right px-4 z-10">

            {/* TEXT col (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start order-last lg:order-first">
              <div className="hero-badge inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs md:text-sm font-semibold mb-4 shadow-md cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                <span>{initialized ? settings.title : "معمار بصری، تدوینگر و تولیدکننده محتوا"}</span>
              </div>

              {/* Vector Art Animation Area (above name) */}
              <div 
                className={`w-full max-w-[340px] h-[75px] mb-2 transition-all duration-500 ease-out origin-bottom ${
                  nameHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-20 scale-95 translate-y-2 pointer-events-none"
                }`}
              >
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" className="rounded-xl" />
                  
                  <path 
                    ref={pathRef}
                    d="M 50 80 Q 200 0 350 80" 
                    fill="none" 
                    stroke="url(#gradient-orange-teal)" 
                    strokeWidth="3" 
                    strokeDasharray="400"
                    strokeDashoffset="400"
                  />
                  
                  <linearGradient id="gradient-orange-teal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff6b35" />
                    <stop offset="100%" stopColor="#00adb5" />
                  </linearGradient>

                  <line 
                    ref={handleLRef} 
                    x1="200" y1="40" x2="130" y2="20" 
                    stroke="#ff6b35" strokeWidth="1.5" strokeDasharray="3" 
                    className="opacity-0"
                  />
                  <line 
                    ref={handleRRef} 
                    x1="200" y1="40" x2="270" y2="20" 
                    stroke="#00adb5" strokeWidth="1.5" strokeDasharray="3" 
                    className="opacity-0"
                  />
                  
                  <circle cx="50" cy="80" r="5" fill="#ff6b35" />
                  <circle cx="350" cy="80" r="5" fill="#00adb5" />
                  <circle cx="200" cy="40" r="6" fill="#ffffff" stroke="#ff6b35" strokeWidth="2" />
                  
                  <circle ref={handleDotLRef} cx="130" cy="20" r="4" fill="#ff6b35" className="opacity-0" />
                  <circle ref={handleDotRRef} cx="270" cy="20" r="4" fill="#00adb5" className="opacity-0" />

                  <g ref={penRef} style={{ transform: "translate(50px, 80px)" }}>
                    <path 
                      d="M 0 0 L -8 -16 L -2 -19 L -4 -26 L 4 -26 L 2 -19 L 8 -16 Z" 
                      fill="#ffffff" 
                      stroke="#111115" 
                      strokeWidth="1.5" 
                    />
                    <path d="M 0 0 L 0 -16" stroke="#ff6b35" strokeWidth="1.5" />
                    <circle cx="0" cy="-16" r="2" fill="#00adb5" />
                  </g>
                </svg>
              </div>

              {/* Glowing Interactive Main Name */}
              <h1 
                onMouseEnter={() => setNameHovered(true)}
                onMouseLeave={() => setNameHovered(false)}
                className={`hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight cursor-pointer select-none transition-all duration-500 ${
                  nameHovered 
                    ? "text-brand-orange drop-shadow-[0_0_25px_rgba(255,107,53,0.85)] scale-[1.01]" 
                    : "text-white"
                }`}
              >
                {initialized ? settings.name : "بابک زنگنه محبی"}
              </h1>

              <h2 className="hero-desc text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-l from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent mb-6 leading-relaxed">
                من زبان برندها را به «حرکت» و «تصویر» تبدیل می‌کنم.
              </h2>

              <p className="hero-desc text-zinc-400 max-w-2xl text-sm sm:text-base leading-loose mb-10 text-center lg:text-right">
                {initialized ? settings.bio : "متخصص طراحی گرافیک، چاپ عریض، تدوین سینماتیک تیزرهای تبلیغاتی و لوگوموشن."}
              </p>

              <div className="hero-buttons flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-center lg:justify-start">
                <button
                  onClick={() => scrollTo("portfolio")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(255,107,53,0.4)] transition-all cursor-pointer"
                >
                  مشاهده نمونه‌کارها
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-sm font-semibold cursor-pointer"
                >
                  ارتباط با من
                </button>
              </div>
            </div>

            {/* PROFILE IMAGE col (5 cols) — PARALLAX */}
            <div className="lg:col-span-5 flex justify-center items-center relative mt-6 lg:mt-0" style={{ perspective: "1000px" }}>
              <div
                ref={profileGlowRef}
                className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-brand-orange to-brand-teal opacity-20 blur-3xl pointer-events-none"
              />

              <div
                ref={profileImageRef}
                className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] rounded-3xl overflow-hidden border border-zinc-700/50 bg-black/40 shadow-2xl glass will-change-transform"
              >
                <img
                  src={`${basePath}/images/babak.jpg`}
                  alt="بابک زنگنه محبی"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-3xl border border-white/8 pointer-events-none" />
              </div>

              {/* Small floating stat cards around photo */}
              <div className="absolute -bottom-3 -right-3 px-4 py-2.5 rounded-2xl glass border border-zinc-700/60 shadow-xl hidden sm:block">
                <span className="block text-[9px] text-zinc-500 font-bold">سابقه کار</span>
                <span className="font-black text-white text-base leading-none">{initialized ? settings.workExperienceYears : "۵+"}</span>
              </div>
              <div className="absolute -top-3 -left-3 px-4 py-2.5 rounded-2xl glass border border-zinc-700/60 shadow-xl hidden sm:block">
                <span className="block text-[9px] text-zinc-500 font-bold">پروژه‌ها</span>
                <span className="font-black text-brand-orange text-base leading-none">{initialized ? projects.length : 6}+</span>
              </div>
            </div>

          </div>

          {/* Scroll Indicator */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer text-zinc-500 hover:text-white transition-colors"
            onClick={() => scrollTo("portfolio")}
          >
            <span className="text-[10px] font-bold tracking-widest uppercase">اسکرول به پایین</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </section>

        {/* PORTFOLIO */}
        {initialized && (
          <PortfolioGrid projects={projects} categories={categories} />
        )}

        {/* TIMELINE */}
        {initialized && (
          <ResumeTimeline timeline={timeline} resumeFileUrl={settings.resumeFileUrl} />
        )}

        {/* CONTACT */}
        <ContactForm />

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-900 bg-[#050507] py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-black text-white text-base tracking-widest">{initialized ? settings.name : "بابک زنگنه محبی"}</span>
            <span className="text-[10px] text-zinc-500 font-semibold">پورتفولیو حرفه‌ای طراحی و تدوین | ۱۳۹۸ - ۱۴۰۵</span>
          </div>
          <p className="text-xs text-zinc-600 order-last md:order-none">
            © {new Date().getFullYear()} تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            {[
              { href: `mailto:${initialized ? settings.email : "babakzangenemohebi@gmail.com"}`, label: "@", title: "ایمیل" },
              { href: initialized ? settings.instagram : "https://instagram.com/babakzangenemohebi", label: "ig", title: "اینستاگرام" },
              { href: initialized ? settings.telegram : "https://t.me/B4BACK", label: "tg", title: "تلگرام" },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                title={link.title}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:border-brand-orange hover:bg-brand-orange/5 transition-all text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
