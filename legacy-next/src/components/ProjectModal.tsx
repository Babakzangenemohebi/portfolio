"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Calendar, User, Wrench, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/data/projects";
import gsap from "gsap";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    if (project) {
      // Fade in overlay
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      // Slide up modal
      gsap.fromTo(
        modalRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
      );
      
      // Disable body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  // Reset slider index when project changes
  useEffect(() => {
    setMediaIndex(0);
  }, [project]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      y: 30,
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          onComplete: onClose,
        });
      },
    });
  };

  if (!project) return null;

  // Compile media items from gallery or fallback to main media
  const gallery = project.mediaGallery && project.mediaGallery.length > 0
    ? project.mediaGallery
    : [
        ...(project.videoUrl ? [{ type: "video" as const, url: project.videoUrl }] : []),
        { type: "image" as const, url: project.mediaUrl }
      ];

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl rounded-3xl bg-[#111115] border border-zinc-800 shadow-2xl overflow-hidden glass max-h-[90vh] md:max-h-none flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-35 p-2 rounded-full bg-black/50 border border-zinc-700 text-zinc-350 hover:text-white hover:scale-110 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Media Carousel (Videos or Images) */}
        <div className="w-full md:w-3/5 bg-black/40 flex items-center justify-center border-b md:border-b-0 md:border-l border-zinc-800 min-h-[300px] md:min-h-[500px] relative overflow-hidden group/media">
          
          {gallery[mediaIndex].type === "video" ? (
            <div className="w-full h-full relative aspect-video flex items-center justify-center bg-black">
              <video
                key={gallery[mediaIndex].url}
                src={gallery[mediaIndex].url}
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                playsInline
              />
            </div>
          ) : (
            <div className="w-full h-full relative aspect-[4/3] md:aspect-auto flex items-center justify-center overflow-hidden">
              <img
                src={gallery[mediaIndex].url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Carousel Navigation Arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute right-4 p-2.5 rounded-full bg-black/60 border border-zinc-850 text-zinc-300 hover:text-white hover:bg-black/80 hover:scale-105 transition-all z-20 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute left-4 p-2.5 rounded-full bg-black/60 border border-zinc-850 text-zinc-300 hover:text-white hover:bg-black/80 hover:scale-105 transition-all z-20 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Progress Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setMediaIndex(i); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === mediaIndex ? "bg-brand-orange w-5" : "bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category Tag */}
            <span className="inline-block px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-3">
              {project.categoryLabel}
            </span>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-white mb-4">
              {project.title}
            </h2>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-zinc-800/80 mb-6">
              {project.client && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <User className="w-4 h-4 text-brand-teal" />
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-medium">کارفرما</span>
                    <span className="font-semibold">{project.client}</span>
                  </div>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Calendar className="w-4 h-4 text-brand-teal" />
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-medium">سال اجرا</span>
                    <span className="font-semibold">{project.year}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Description */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-zinc-400 mb-2">توضیحات پروژه</h4>
              <p className="text-sm md:text-base leading-loose text-zinc-300 text-justify">
                {project.longDescription}
              </p>
            </div>
          </div>

          <div>
            {/* Tools Badges */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
                <Wrench className="w-3.5 h-3.5 text-brand-orange" />
                <span>ابزارهای استفاده شده</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-200 text-xs border border-zinc-700/50"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
                <Tag className="w-3.5 h-3.5 text-brand-orange" />
                <span>برچسب‌ها</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-zinc-400 hover:text-brand-teal transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
