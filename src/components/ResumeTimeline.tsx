"use client";

import React, { useEffect, useRef } from "react";
import { 
  Briefcase, Award, Cpu, Layers, Download,
  FileImage, PenTool, Film, Sparkles, Volume2, Compass, Music,
  Lightbulb, Type, Globe, Play
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TimelineItem } from "@/hooks/usePortfolioStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SoftwareSkill {
  name: string;
  level: number; // percentage
  abbr: string;
  color: string;
}

interface ResumeTimelineProps {
  timeline: TimelineItem[];
  resumeFileUrl: string;
}

export default function ResumeTimeline({ timeline = [], resumeFileUrl = "/resume.pdf" }: ResumeTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const softwareSkills: SoftwareSkill[] = [
    { name: "Adobe Photoshop", level: 95, abbr: "Ps", color: "#ff6b35" },
    { name: "Adobe Illustrator", level: 90, abbr: "Ai", color: "#ff8452" },
    { name: "Adobe Premiere Pro", level: 92, abbr: "Pr", color: "#00adb5" },
    { name: "Adobe After Effects", level: 85, abbr: "Ae", color: "#38bdf8" },
    { name: "Adobe Audition", level: 80, abbr: "Au", color: "#4ade80" },
    { name: "CorelDRAW", level: 88, abbr: "Corel", color: "#fbbf24" },
    { name: "Ableton Live", level: 75, abbr: "Ableton", color: "#ec4899" },
  ];

  const skillIcons: { [key: string]: React.ReactNode } = {
    Ps: <FileImage className="w-4.5 h-4.5" />,
    Ai: <PenTool className="w-4.5 h-4.5" />,
    Pr: <Film className="w-4.5 h-4.5" />,
    Ae: <Sparkles className="w-4.5 h-4.5" />,
    Au: <Volume2 className="w-4.5 h-4.5" />,
    Corel: <Compass className="w-4.5 h-4.5" />,
    Ableton: <Music className="w-4.5 h-4.5" />,
  };

  const coreSkills = [
    { name: "ادیت حرفه‌ای تصاویر", icon: <FileImage className="w-4 h-4" /> },
    { name: "تدوین سینماتیک ویدیو", icon: <Film className="w-4 h-4" /> },
    { name: "ساخت وکتور", icon: <PenTool className="w-4 h-4" /> },
    { name: "موشن‌گرافی", icon: <Sparkles className="w-4 h-4" /> },
    { name: "لوگوموشن", icon: <Play className="w-4 h-4" /> },
    { name: "تایپوگرافی مدرن", icon: <Type className="w-4 h-4" /> },
    { name: "آهنگسازی و طراحی صدا", icon: <Music className="w-4 h-4" /> },
    { name: "ایده‌پردازی سناریو", icon: <Lightbulb className="w-4 h-4" /> },
    { name: "تلفیق هوش مصنوعی", icon: <Cpu className="w-4 h-4" /> },
    { name: "زبان انگلیسی تخصصی", icon: <Globe className="w-4 h-4" /> }
  ];

  useEffect(() => {
    // GSAP Scroll Animation for timeline cards
    const cards = gsap.utils.toArray(".timeline-card");
    cards.forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Animate skill progress bars
    const bars = gsap.utils.toArray(".skill-progress-bar");
    bars.forEach((bar: any) => {
      const width = bar.getAttribute("data-width");
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: `${width}%`,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 90%",
          },
        }
      );
    });

    // GSAP ScrollTrigger for the download button attention grabber
    gsap.fromTo(
      ".resume-download-btn",
      { scale: 0.3, opacity: 0, rotation: -10 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        ease: "elastic.out(1.1, 0.6)",
        scrollTrigger: {
          trigger: ".resume-download-btn",
          start: "top 90%",
          toggleActions: "play none none none",
        },
        onComplete: () => {
          // Trigger a quick attention-seeking double wobble
          gsap.timeline()
            .to(".resume-download-btn", { x: -10, duration: 0.08, ease: "sine.inOut" })
            .to(".resume-download-btn", { x: 8, duration: 0.08, ease: "sine.inOut" })
            .to(".resume-download-btn", { x: -6, duration: 0.08, ease: "sine.inOut" })
            .to(".resume-download-btn", { x: 4, duration: 0.08, ease: "sine.inOut" })
            .to(".resume-download-btn", { x: 0, duration: 0.08, ease: "sine.inOut" });
        }
      }
    );
  }, [timeline]); // trigger animation when timeline mounts/updates

  return (
    <section id="experience" className="relative w-full max-w-6xl mx-auto px-4 py-20 z-10">
      {/* Section Title */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-semibold mb-3">
          <Briefcase className="w-3 h-3" />
          سوابق و مهارت‌ها
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
          مسیر حرفه‌ای و ابزارها
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          مروری بر همکاری‌های من با آژانس‌ها و شرکت‌های معتبر تبلیغاتی و هنری، همراه با تسلط نرم‌افزاری.
        </p>

        {/* PDF Resume Download Button */}
        <div className="mt-8 flex flex-col items-center">
          <a
            href={resumeFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="Babak_Zangeneh_Resume.pdf"
            className="resume-download-btn resume-download-btn-premium flex items-center gap-3 px-10 py-4.5 rounded-2xl bg-zinc-950 border-2 font-black text-sm text-zinc-100 hover:text-white transition-all shadow-2xl cursor-pointer group select-none hover:scale-105"
          >
            <Download className="w-5 h-5 text-brand-teal group-hover:animate-bounce transition-transform duration-300" />
            دانلود فایل رزومه (PDF)
          </a>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer-sweep {
              0% { transform: translateX(-150%) skewX(-25deg); }
              100% { transform: translateX(150%) skewX(-25deg); }
            }
            @keyframes neon-breath {
              0%, 100% { 
                box-shadow: 0 0 5px rgba(0, 173, 181, 0.2), 0 0 15px rgba(0, 173, 181, 0.1); 
                border-color: rgba(0, 173, 181, 0.3); 
              }
              50% { 
                box-shadow: 0 0 20px rgba(0, 173, 181, 0.7), 0 0 35px rgba(0, 173, 181, 0.3); 
                border-color: rgba(0, 173, 181, 0.9); 
              }
            }
            .resume-download-btn-premium {
              position: relative;
              overflow: hidden;
              animation: neon-breath 3s infinite ease-in-out;
            }
            .resume-download-btn-premium::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 200%;
              height: 100%;
              background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.03) 30%,
                rgba(255, 255, 255, 0.35) 50%,
                rgba(255, 255, 255, 0.03) 70%,
                rgba(255, 255, 255, 0) 100%
              );
              transform: translateX(-150%) skewX(-25deg);
              animation: shimmer-sweep 4s infinite linear;
            }
            .resume-download-btn-premium:hover::after {
              animation: shimmer-sweep 1.2s infinite linear;
            }
          `}} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Career Timeline - 7 cols */}
        <div className="lg:col-span-7 relative">
          <h3 className="text-lg md:text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-orange" />
            سوابق همکاری و تجارب شغلی
          </h3>

          {/* Timeline Center Line */}
          <div className="absolute right-4 top-14 bottom-4 w-0.5 bg-gradient-to-b from-brand-orange via-brand-teal to-transparent" />

          <div className="space-y-10 pr-10">
            {timeline.length === 0 ? (
              <div className="text-zinc-500 text-sm py-12 text-center">هیچ سابقه کاری ثبت نشده است.</div>
            ) : (
              timeline.map((item, idx) => (
                <div key={item.id} className="timeline-card relative group">
                  {/* Timeline Dot Indicator */}
                  <div 
                    className="absolute -right-[49px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center group-hover:scale-125 transition-transform duration-350 z-10"
                    style={{ 
                      borderColor: item.company.includes("شتاب") ? "#eab308" : item.color,
                      background: item.company.includes("شتاب") ? "linear-gradient(135deg, #ef4444, #eab308)" : "#09090b",
                      boxShadow: item.company.includes("شتاب") ? `0 0 10px rgba(239, 68, 68, 0.8)` : `0 0 10px ${item.color}80`
                    }}
                  />

                  {/* Info Card */}
                  <div className="glass p-6 md:p-8 rounded-3xl glow-hover shadow-lg">
                    {/* Period Badge */}
                    <span 
                      className="inline-block px-2.5 py-1 rounded-md border text-[10px] md:text-xs font-semibold mb-3"
                      style={{ 
                        color: item.company.includes("شتاب") ? "#ef4444" : item.color,
                        borderColor: item.company.includes("شتاب") ? "#eab30840" : `${item.color}40`,
                        background: item.company.includes("شتاب") ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(234, 179, 8, 0.15))" : "rgba(39, 39, 42, 0.5)"
                      }}
                    >
                      {item.period}
                    </span>

                    {/* Role & Company */}
                    <h4 className="text-base md:text-lg font-bold text-white mb-1">
                      {item.role}
                    </h4>
                    <p 
                      className={`text-xs md:text-sm font-semibold mb-4 ${
                        item.company.includes("شتاب") ? "bg-gradient-to-l from-[#ef4444] to-[#eab308] bg-clip-text text-transparent font-bold" : ""
                      }`}
                      style={item.company.includes("شتاب") ? undefined : { color: item.color }}
                    >
                      {item.company}
                    </p>

                    {/* Summary */}
                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Bullet points */}
                    <ul className="space-y-2.5 text-xs md:text-sm text-zinc-300 pr-4 list-disc marker:text-brand-orange/60">
                      {item.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="leading-relaxed text-justify">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills & Software - 5 cols */}
        <div className="lg:col-span-5 space-y-12">
          {/* Software Skills */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-8 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-teal" />
              تخصص و ابزارهای نرم‌افزاری
            </h3>

            <div className="glass p-6 md:p-8 rounded-3xl space-y-6">
              {softwareSkills.map((skill, idx) => (
                <div key={idx} className="space-y-2 group/skill">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      {/* Flip container for 3D card effect on hover */}
                      <div className="relative w-8 h-8 rounded-lg shrink-0 border border-zinc-800/80 cursor-pointer" style={{ perspective: "150px" }}>
                        <div 
                          className="relative w-full h-full transition-transform duration-500 ease-out group-hover/skill:[transform:rotateY(180deg)]"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Front - Abbreviation */}
                          <div 
                            className="absolute inset-0 flex items-center justify-center font-bold text-[10px] bg-zinc-800 text-white rounded-lg"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            {skill.abbr}
                          </div>
                          {/* Back - Mapped Icon */}
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded-lg [transform:rotateY(180deg)]"
                            style={{ backfaceVisibility: "hidden", color: skill.color }}
                          >
                            {skillIcons[skill.abbr] || skill.abbr}
                          </div>
                        </div>
                      </div>
                      
                      <span className="font-semibold text-zinc-200 group-hover/skill:text-white transition-colors">
                        {skill.name}
                      </span>
                    </div>
                    <span className="text-zinc-400 font-mono text-xs group-hover/skill:text-brand-orange transition-colors">
                      {skill.level}%
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                    <div
                      className="skill-progress-bar h-full rounded-full transition-all group-hover/skill:scale-y-110 origin-right duration-300"
                      data-width={skill.level}
                      style={{
                        backgroundColor: skill.color,
                        boxShadow: `0 0 10px ${skill.color}80`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Capacities */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-orange" />
              مهارت‌های کلیدی و توانمندی‌ها
            </h3>

            <div className="flex flex-wrap gap-2.5 p-4 glass rounded-3xl">
              {coreSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="group flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white hover:border-brand-teal/40 hover:bg-brand-teal/5 transition-all text-xs md:text-sm font-medium cursor-default overflow-hidden"
                >
                  {/* Dynamic sliding hover icon */}
                  <span className="w-0 group-hover:w-4.5 opacity-0 group-hover:opacity-100 transition-all duration-350 ease-out shrink-0 text-brand-teal flex items-center">
                    {skill.icon}
                  </span>
                  <span className="transition-all duration-300 group-hover:translate-x-0.5">
                    {skill.name}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
