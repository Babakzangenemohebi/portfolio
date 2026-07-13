"use client";

import React, { useState, useRef } from "react";
import { Play, Eye, Sparkles } from "lucide-react";
import { ManagedProject, Category } from "@/hooks/usePortfolioStore";
import ProjectModal from "./ProjectModal";
import gsap from "gsap";

interface PortfolioGridProps {
  projects: ManagedProject[];
  categories: Category[];
}

export default function PortfolioGrid({ projects = [], categories = [] }: PortfolioGridProps) {
  const [filter, setFilter] = useState<string>("all");
  const [activeProject, setActiveProject] = useState<ManagedProject | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Visible projects only
  const visibleProjects = projects.filter(p => p.visible);

  // Filter
  const filteredProjects = filter === "all"
    ? visibleProjects
    : visibleProjects.filter(p => p.category === filter);

  const handleFilterChange = (category: string) => {
    gsap.to(".portfolio-card", {
      scale: 0.9, opacity: 0, duration: 0.2, stagger: 0.04, ease: "power2.in",
      onComplete: () => {
        setFilter(category);
        setTimeout(() => {
          gsap.fromTo(".portfolio-card",
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
          );
        }, 50);
      },
    });
  };

  // 3D Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((cy - y) / cy) * 8;
    const rotY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    const glow = card.querySelector(".card-glow") as HTMLDivElement;
    if (glow) glow.style.background = `radial-gradient(circle 120px at ${x}px ${y}px, rgba(255,107,53,0.15), transparent 80%)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    card.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
    const glow = card.querySelector(".card-glow") as HTMLDivElement;
    if (glow) glow.style.background = "transparent";
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transition = "none";
  };

  const handleVideoHover = (e: React.MouseEvent<HTMLDivElement>, play: boolean) => {
    const video = e.currentTarget.querySelector("video") as HTMLVideoElement;
    if (!video) return;
    if (play) video.play().catch(() => {});
    else { video.pause(); video.currentTime = 0; }
  };

  const getGridSpan = (index: number) => {
    switch (index % 6) {
      case 0: return "md:col-span-2 md:row-span-1";
      case 1: return "md:col-span-1 md:row-span-2";
      case 4: return "md:col-span-2 md:row-span-1";
      default: return "md:col-span-1 md:row-span-1";
    }
  };

  // Filter tabs from active categories + "all"
  const filterTabs = [
    { label: "همه آثار", value: "all" },
    ...categories.map(c => ({ label: c.label, value: c.value })),
  ];

  return (
    <section id="portfolio" className="relative w-full max-w-6xl mx-auto px-4 py-20 z-10">
      {/* Section Title */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-3">
          <Sparkles className="w-3 h-3" />
          نمونه‌کارها
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">شبکه بصری پروژه‌ها</h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          کاوشی در میان پروژه‌های چاپی عریض، تدوین سینماتیک ویدیو، جلوه‌های بصری موشن‌گرافیک و ایده‌پردازی مولد با هوش مصنوعی.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 border cursor-pointer ${
              filter === tab.value
                ? "bg-brand-orange text-black border-brand-orange shadow-[0_0_20px_-3px_rgba(255,107,53,0.35)]"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="py-32 text-center text-zinc-600">
          <p className="text-lg font-bold mb-2">هیچ پروژه‌ای برای نمایش وجود ندارد</p>
          <p className="text-sm">از پنل مدیریت می‌توانید پروژه‌ها را فعال یا اضافه کنید</p>
        </div>
      )}

      {/* Bento Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] md:auto-rows-[340px]"
      >
        {filteredProjects.map((project, index) => {
          const isVideoCard = !!project.videoUrl;
          const gridSpan = getGridSpan(index);

          return (
            <div
              key={project.id}
              onClick={() => setActiveProject(project)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              onMouseOver={e => isVideoCard && handleVideoHover(e, true)}
              onMouseOut={e => isVideoCard && handleVideoHover(e, false)}
              className={`portfolio-card group relative rounded-3xl overflow-hidden glass cursor-pointer shadow-xl glow-hover transition-transform duration-500 ${gridSpan} ${project.featured ? "ring-2 ring-yellow-400/30" : ""}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Featured badge */}
              {project.featured && (
                <div className="absolute top-4 right-4 z-30 px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 text-[10px] font-bold flex items-center gap-1">
                  ⭐ ویژه
                </div>
              )}

              <div className="card-glow absolute inset-0 pointer-events-none z-10 transition-all duration-300" />

              {/* Media */}
              <div className="absolute inset-0 w-full h-full bg-zinc-950/60 z-0">
                {isVideoCard ? (
                  <div className="relative w-full h-full">
                    <img
                      src={project.coverUrl || project.mediaUrl}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300 z-10"
                    />
                    <video src={project.videoUrl} className="w-full h-full object-cover" muted loop playsInline />
                  </div>
                ) : (
                  <img
                    src={project.coverUrl || project.mediaUrl}
                    alt={project.title}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
              </div>

              {/* Action indicator */}
              <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-zinc-700/50 backdrop-blur-sm text-brand-orange">
                  {isVideoCard ? <Play className="w-4 h-4 fill-brand-orange" /> : <Eye className="w-4 h-4" />}
                </span>
              </div>

              {/* Card Content */}
              <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8 z-20">
                <span className="text-[10px] md:text-xs font-semibold text-brand-teal uppercase tracking-wide mb-2 block">
                  {project.categoryLabel}
                </span>
                <h3 className="text-base md:text-xl font-bold text-white group-hover:text-brand-orange transition-colors leading-relaxed mb-2 max-w-xl">
                  {project.title}
                </h3>
                <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 leading-relaxed max-w-lg mb-3 opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-16 overflow-hidden transition-all duration-350">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}
