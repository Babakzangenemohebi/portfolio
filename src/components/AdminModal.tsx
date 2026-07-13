"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Plus, Trash2, Eye, EyeOff, Star, StarOff, Settings2, LayoutGrid, 
  FolderPlus, ChevronDown, RotateCcw, Check, Lock, LogOut, Edit3, Upload, 
  Film, FileImage, Briefcase, FileText, UserCheck, Trash, Crop
} from "lucide-react";
import gsap from "gsap";
import { ManagedProject, Category, GeneralSettings, TimelineItem } from "@/hooks/usePortfolioStore";
import ImageCropper from "./ImageCropper";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ManagedProject[];
  categories: Category[];
  settings: GeneralSettings;
  timeline: TimelineItem[];
  token: string | null;
  onSetToken: (token: string | null) => void;
  onDeleteProject: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onAddProject: (project: Omit<ManagedProject, "id">) => void;
  onUpdateProject: (id: string, updates: Partial<ManagedProject>) => void;
  onAddCategory: (cat: Omit<Category, "id">) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateSettings: (updates: Partial<GeneralSettings>) => void;
  onAddTimelineItem: (item: Omit<TimelineItem, "id">) => void;
  onUpdateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  onDeleteTimelineItem: (id: string) => void;
  onReset: () => void;
}

type Tab = "projects" | "timeline" | "settings" | "categories";

const CATEGORY_COLORS = ["#ff6b35", "#00adb5", "#38bdf8", "#a855f7", "#4ade80", "#fbbf24", "#ec4899", "#f43f5e", "#ef4444"];

const emptyForm = {
  title: "",
  category: "ai" as ManagedProject["category"],
  categoryLabel: "",
  description: "",
  longDescription: "",
  tags: "",
  tools: "",
  mediaUrl: "",
  coverUrl: "",
  videoUrl: "",
  client: "",
  year: "",
  highlightColor: "#ff6b35",
  visible: true,
  featured: false,
  mediaGallery: [] as { type: "image" | "video"; url: string }[],
};

const emptyTimelineForm = {
  company: "",
  role: "",
  period: "",
  description: "",
  bulletPoints: "",
  color: "#ff6b35",
};

export default function AdminModal({
  isOpen, onClose,
  projects, categories, settings, timeline,
  token, onSetToken,
  onDeleteProject, onToggleVisibility, onToggleFeatured, onAddProject, onUpdateProject,
  onAddCategory, onDeleteCategory, onUpdateSettings,
  onAddTimelineItem, onUpdateTimelineItem, onDeleteTimelineItem,
  onReset,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  
  // Project sub-views and states
  const [projectForm, setProjectForm] = useState(emptyForm);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  
  // Timeline states
  const [timelineForm, setTimelineForm] = useState(emptyTimelineForm);
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState<GeneralSettings>(settings);

  // Category states
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatValue, setNewCatValue] = useState("");
  const [newCatColor, setNewCatColor] = useState("#ff6b35");

  // Media gallery helper state
  const [newMediaItem, setNewMediaItem] = useState<{ type: "image" | "video"; url: string }>({ type: "image", url: "" });

  const [formSuccess, setFormSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [timelineDeleteConfirm, setTimelineDeleteConfirm] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  // Image Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageUrl, setCropperImageUrl] = useState<string | null>(null);
  const [cropperMode, setCropperMode] = useState<"add" | "edit">("add"); // which form to update

  // Authentication states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const loginCardRef = useRef<HTMLDivElement>(null);

  // Sync settings when they load
  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Animate in/out
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";

    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power2.out" }
    );

    if (token) {
      gsap.fromTo(panelRef.current,
        { y: "-100%", opacity: 0, scale: 0.92, rotateX: -8 },
        { y: "0%", opacity: 1, scale: 1, rotateX: 0, duration: 0.65, ease: "back.out(1.4)", delay: 0.05 }
      );
      gsap.fromTo(".admin-tab-btn",
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out", delay: 0.3 }
      );
    } else {
      gsap.fromTo(loginCardRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
      );
    }

    return () => { document.body.style.overflow = ""; };
  }, [isOpen, token]);

  const handleClose = () => {
    const target = token ? panelRef.current : loginCardRef.current;
    gsap.to(target, { y: "-100%", opacity: 0, scale: 0.95, duration: 0.35, ease: "power2.in" });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, delay: 0.1,
      onComplete: onClose,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSetToken(data.token);
      } else {
        setAuthError(data.error || "نام کاربری یا رمز عبور اشتباه است");
        gsap.fromTo(loginCardRef.current,
          { x: -10 },
          { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
        );
      }
    } catch (err) {
      setAuthError("خطا در ارتباط با سرور");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    onSetToken(null);
    setEditingProject(null);
    setEditingTimeline(null);
    setIsAddingProject(false);
    setIsAddingTimeline(false);
    setActiveTab("projects");
  };

  const handleTabChange = (tab: Tab) => {
    setEditingProject(null);
    setEditingTimeline(null);
    setIsAddingProject(false);
    setIsAddingTimeline(false);
    gsap.fromTo(".admin-content",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
    setActiveTab(tab);
    setFormSuccess(false);
  };

  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingProject) return;
    setEditingProject((prev: any) => prev ? { ...prev, [e.target.name]: e.target.value } : null);
  };

  // Upload file helper (Images & PDF)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "image" | "pdf", mode: "add" | "edit" | "settings") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token || ""}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (mode === "settings") {
          setSettingsForm((prev: any) => ({ ...prev, resumeFileUrl: data.url }));
        } else if (mode === "edit" && editingProject) {
          setEditingProject((prev: any) => prev ? { ...prev, mediaUrl: data.url } : null);
          // Open cropper for cover selection
          setCropperImageUrl(data.url);
          setCropperMode("edit");
          setCropperOpen(true);
        } else {
          setProjectForm((prev: any) => ({ ...prev, mediaUrl: data.url }));
          // Open cropper for cover selection
          setCropperImageUrl(data.url);
          setCropperMode("add");
          setCropperOpen(true);
        }
      } else {
        alert(data.error || "خطا در آپلود فایل");
      }
    } catch (err) {
      console.error(err);
      alert("آپلود ناموفق بود");
    }
  };

  // Handle crop completion - upload cropped blob and store as coverUrl
  const handleCropComplete = async (croppedBlob: Blob, croppedDataUrl: string) => {
    setCropperOpen(false);

    const formData = new FormData();
    formData.append("file", croppedBlob, "cover.jpg");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token || ""}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (cropperMode === "edit" && editingProject) {
          setEditingProject((prev: any) => prev ? { ...prev, coverUrl: data.url } : null);
        } else {
          setProjectForm((prev: any) => ({ ...prev, coverUrl: data.url }));
        }
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      // Fallback: use data URL directly (client-side only, no persistence)
      if (cropperMode === "edit" && editingProject) {
        setEditingProject((prev: any) => prev ? { ...prev, coverUrl: croppedDataUrl } : null);
      } else {
        setProjectForm((prev: any) => ({ ...prev, coverUrl: croppedDataUrl }));
      }
    }
  };

  // Open cropper manually for an existing image
  const openCropperForExisting = (imageUrl: string, mode: "add" | "edit") => {
    if (!imageUrl) return;
    setCropperImageUrl(imageUrl);
    setCropperMode(mode);
    setCropperOpen(true);
  };

  // Gallery-specific Helpers
  const addGalleryItem = () => {
    if (!newMediaItem.url) return;
    if (editingProject) {
      const gallery = editingProject.mediaGallery || [];
      setEditingProject((prev: any) => ({
        ...prev,
        mediaGallery: [...gallery, newMediaItem],
      }));
    } else {
      setProjectForm((prev: any) => ({
        ...prev,
        mediaGallery: [...prev.mediaGallery, newMediaItem],
      }));
    }
    setNewMediaItem({ type: "image", url: "" });
  };

  const removeGalleryItem = (index: number) => {
    if (editingProject) {
      const gallery = editingProject.mediaGallery || [];
      setEditingProject((prev: any) => ({
        ...prev,
        mediaGallery: gallery.filter((_: any, i: number) => i !== index),
      }));
    } else {
      setProjectForm((prev: any) => ({
        ...prev,
        mediaGallery: prev.mediaGallery.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token || ""}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const uploadedItem = { type: newMediaItem.type, url: data.url };
        if (editingProject) {
          const gallery = editingProject.mediaGallery || [];
          setEditingProject((prev: any) => ({
            ...prev,
            mediaGallery: [...gallery, uploadedItem],
          }));
        } else {
          setProjectForm((prev: any) => ({
            ...prev,
            mediaGallery: [...prev.mediaGallery, uploadedItem],
          }));
        }
      } else {
        alert(data.error || "خطا در آپلود فایل");
      }
    } catch (err) {
      console.error(err);
      alert("آپلود ناموفق بود");
    }
  };

  // Submit Projects
  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCat = categories.find(c => c.value === projectForm.category);
    onAddProject({
      title: projectForm.title,
      category: projectForm.category,
      categoryLabel: selectedCat?.label || projectForm.categoryLabel,
      description: projectForm.description,
      longDescription: projectForm.longDescription,
      tags: projectForm.tags.split("،").map(t => t.trim()).filter(Boolean),
      tools: projectForm.tools.split("،").map(t => t.trim()).filter(Boolean),
      mediaUrl: projectForm.mediaUrl || "/images/projects/poster-glass.png",
      coverUrl: projectForm.coverUrl || undefined,
      videoUrl: projectForm.videoUrl || undefined,
      client: projectForm.client || undefined,
      year: projectForm.year || undefined,
      highlightColor: projectForm.highlightColor,
      mediaGallery: projectForm.mediaGallery,
      visible: true,
      featured: false,
    });
    setFormSuccess(true);
    setProjectForm({ ...emptyForm, mediaGallery: [] });
    setIsAddingProject(false);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const handleUpdateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const selectedCat = categories.find(c => c.value === editingProject.category);
    const tagsArray = Array.isArray(editingProject.tags) 
      ? editingProject.tags 
      : (editingProject.tags as string).split("،").map(t => t.trim()).filter(Boolean);
    const toolsArray = Array.isArray(editingProject.tools) 
      ? editingProject.tools 
      : (editingProject.tools as string).split("،").map(t => t.trim()).filter(Boolean);

    onUpdateProject(editingProject.id, {
      title: editingProject.title,
      category: editingProject.category,
      categoryLabel: selectedCat?.label || editingProject.categoryLabel,
      description: editingProject.description,
      longDescription: editingProject.longDescription,
      tags: tagsArray,
      tools: toolsArray,
      mediaUrl: editingProject.mediaUrl,
      coverUrl: editingProject.coverUrl || undefined,
      videoUrl: editingProject.videoUrl || undefined,
      client: editingProject.client || undefined,
      year: editingProject.year || undefined,
      highlightColor: editingProject.highlightColor,
      mediaGallery: editingProject.mediaGallery || [],
    });

    setEditingProject(null);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Submit Settings
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Submit Timeline
  const handleTimelineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimelineForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditTimelineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingTimeline) return;
    setEditingTimeline(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
  };

  const handleAddTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTimelineItem({
      company: timelineForm.company,
      role: timelineForm.role,
      period: timelineForm.period,
      description: timelineForm.description,
      bulletPoints: timelineForm.bulletPoints.split("\n").map(line => line.trim()).filter(Boolean),
      color: timelineForm.color,
    });
    setFormSuccess(true);
    setTimelineForm(emptyTimelineForm);
    setIsAddingTimeline(false);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const handleUpdateTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeline) return;

    const bullets = Array.isArray(editingTimeline.bulletPoints)
      ? editingTimeline.bulletPoints
      : (editingTimeline.bulletPoints as string).split("\n").map(l => l.trim()).filter(Boolean);

    onUpdateTimelineItem(editingTimeline.id, {
      company: editingTimeline.company,
      role: editingTimeline.role,
      period: editingTimeline.period,
      description: editingTimeline.description,
      bulletPoints: bullets,
      color: editingTimeline.color,
    });
    setEditingTimeline(null);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Submit Categories
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel || !newCatValue) return;
    onAddCategory({ label: newCatLabel, value: newCatValue, color: newCatColor });
    setNewCatLabel("");
    setNewCatValue("");
    setNewCatColor("#ff6b35");
  };

  const filteredProjects = filterCat === "all"
    ? projects
    : projects.filter(p => p.category === filterCat);

  if (!isOpen) return null;

  // ── RENDER SECURITY LOGIN SCREEN ──
  if (!token) {
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center py-6 px-4"
        onClick={handleClose}
      >
        <div
          ref={loginCardRef}
          className="relative w-full max-w-md rounded-3xl bg-[#0d0d12] border border-zinc-800 shadow-2xl p-8 flex flex-col gap-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange mb-2">
              <Lock className="w-6 h-6" />
            </span>
            <h2 className="font-black text-white text-xl">ورود به پنل مدیریت</h2>
            <p className="text-zinc-500 text-xs">برای اعمال تغییرات پورتفولیو، وارد شوید.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400">نام کاربری</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm dir-ltr text-left"
                placeholder="babak"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400">رمز عبور</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm dir-ltr text-left"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs font-semibold text-center mt-2">{authError}</p>
            )}

            <button
              type="submit" disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] hover:shadow-[0_0_20px_-3px_rgba(255,107,53,0.4)] transition-all cursor-pointer flex items-center justify-center"
            >
              {isLoggingIn ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-lg flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-5xl rounded-3xl bg-[#0d0d12] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
        style={{ minHeight: "85vh", maxHeight: "90vh", perspective: "1200px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/80 bg-[#0a0a0f]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
              <Settings2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-white text-lg">پنل کنترل و ویرایش سایت</h2>
              <p className="text-zinc-500 text-xs">{projects.length} پروژه · {timeline.length} سابقه کاری · {categories.length} دسته‌بندی</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (confirm("آیا از بازنشانی همه داده‌ها به حالت اولیه مطمئن هستید؟")) onReset(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> بازنشانی دیتابیس
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 text-xs font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> خروج
            </button>
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 px-6 py-4 border-b border-zinc-800/60 shrink-0 overflow-x-auto">
          {([
            { id: "projects",   icon: <LayoutGrid className="w-4 h-4" />,  label: "پروژه‌ها" },
            { id: "timeline",   icon: <Briefcase className="w-4 h-4" />,   label: "سوابق کاری" },
            { id: "settings",   icon: <UserCheck className="w-4 h-4" />,   label: "تنظیمات عمومی" },
            { id: "categories", icon: <FolderPlus className="w-4 h-4" />,  label: "دسته‌بندی‌ها" },
          ] as { id: Tab; icon: React.ReactNode; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`admin-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-brand-orange text-black shadow-[0_0_20px_-5px_rgba(255,107,53,0.5)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="admin-content flex-1 overflow-y-auto px-6 py-6 space-y-4">
          
          {formSuccess && (
            <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 animate-in fade-in duration-300">
              <Check className="w-5 h-5 shrink-0" />
              تغییرات با موفقیت در دیتابیس ثبت شد!
            </div>
          )}

          {/* ─────────── TAB: PROJECTS ─────────── */}
          {activeTab === "projects" && !editingProject && !isAddingProject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-zinc-300">مدیریت نمونه‌کارها</h3>
                <button
                  onClick={() => setIsAddingProject(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-black text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> افزودن پروژه جدید
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setFilterCat("all")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${filterCat === "all" ? "bg-zinc-700 text-white border-zinc-600" : "text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"}`}
                >
                  همه ({projects.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCat(cat.value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${filterCat === cat.value ? "text-black border-transparent" : "text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"}`}
                    style={filterCat === cat.value ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                  >
                    {cat.label} ({projects.filter(p => p.category === cat.value).length})
                  </button>
                ))}
              </div>

              {/* Projects List */}
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    project.visible
                      ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                      : "bg-zinc-950/60 border-zinc-900 opacity-60"
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                    <img src={project.mediaUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-black"
                        style={{ backgroundColor: categories.find(c => c.value === project.category)?.color || "#ff6b35" }}
                      >
                        {project.categoryLabel}
                      </span>
                      {project.year && <span className="text-[10px] text-zinc-500">{project.year}</span>}
                      {project.featured && <span className="text-[10px] text-yellow-400 font-bold">⭐ ویژه</span>}
                      {project.mediaGallery && project.mediaGallery.length > 0 && (
                        <span className="text-[10px] text-brand-teal font-semibold">📸 اسلایدر ({project.mediaGallery.length})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProject({
                          ...project,
                          tags: Array.isArray(project.tags) ? project.tags.join("، ") : project.tags,
                          tools: Array.isArray(project.tools) ? project.tools.join("، ") : project.tools,
                          mediaGallery: project.mediaGallery || [],
                        });
                      }}
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleVisibility(project.id)}
                      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
                        project.visible
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onToggleFeatured(project.id)}
                      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
                        project.featured
                          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-yellow-400"
                      }`}
                    >
                      {project.featured ? <Star className="w-4 h-4 fill-yellow-400" /> : <StarOff className="w-4 h-4" />}
                    </button>

                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDeleteProject(project.id); setDeleteConfirm(null); }}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(project.id)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─────────── SUB-TAB: ADD PROJECT ─────────── */}
          {activeTab === "projects" && isAddingProject && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-md">ثبت نمونه‌کار جدید</h3>
                <button
                  type="button" onClick={() => setIsAddingProject(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  بازگشت
                </button>
              </div>

              <form onSubmit={handleAddProjectSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">عنوان پروژه *</label>
                  <input
                    name="title" value={projectForm.title} onChange={handleProjectFormChange} required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm"
                    placeholder="تیزر ویدیویی قهوه سنتی"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">دسته‌بندی *</label>
                    <select
                      name="category" value={projectForm.category} onChange={handleProjectFormChange} required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">سال اجرا</label>
                    <input
                      name="year" value={projectForm.year} onChange={handleProjectFormChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm"
                      placeholder="۱۴۰۴"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">کارفرما / مشتری</label>
                  <input
                    name="client" value={projectForm.client} onChange={handleProjectFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm"
                    placeholder="مشتری شخصی"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات کوتاه (کارت) *</label>
                  <textarea
                    name="description" value={projectForm.description} onChange={handleProjectFormChange} required rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm resize-none"
                    placeholder="خلاصه‌ای یک جمله‌ای..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات کامل (لایت‌باکس)</label>
                  <textarea
                    name="longDescription" value={projectForm.longDescription} onChange={handleProjectFormChange} rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm resize-none"
                    placeholder="شرح مراحل، نرم افزارها، چالش‌ها..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">برچسب‌ها (با ، جدا کنید)</label>
                    <input
                      name="tags" value={projectForm.tags} onChange={handleProjectFormChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none text-sm"
                      placeholder="اینستاگرام، تدوین، ریلز"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">نرم‌افزارها (با ، جدا کنید)</label>
                    <input
                      name="tools" value={projectForm.tools} onChange={handleProjectFormChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none text-sm"
                      placeholder="پریمیر، فتوشاپ"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">تصویر اصلی پروژه *</label>
                    <div className="flex gap-4 items-start">
                      {/* Main image preview */}
                      <div className="shrink-0 space-y-1.5">
                        <p className="text-[10px] text-zinc-500 text-center">تصویر اصلی</p>
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                          {projectForm.mediaUrl ? (
                            <img src={projectForm.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <FileImage className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Cover preview */}
                      {projectForm.mediaUrl && (
                        <div className="shrink-0 space-y-1.5">
                          <p className="text-[10px] text-zinc-500 text-center">کاور کارت</p>
                          <div
                            className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 cursor-pointer hover:border-brand-orange/60 transition-colors"
                            style={{ borderColor: projectForm.coverUrl ? "#ff6b35" : "#3f3f46" }}
                            onClick={() => openCropperForExisting(projectForm.mediaUrl, "add")}
                            title="کلیک برای ویرایش کراپ"
                          >
                            {projectForm.coverUrl ? (
                              <img src={projectForm.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
                                <Crop className="w-5 h-5" />
                                <span className="text-[8px] font-bold">کراپ کنید</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          name="mediaUrl" value={projectForm.mediaUrl} onChange={handleProjectFormChange} required
                          className="w-full px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-xs dir-ltr text-right focus:outline-none"
                          placeholder="/images/projects/photo.png"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            آپلود عکس پروژه
                            <input
                              type="file" accept="image/*" className="hidden"
                              onChange={e => handleFileUpload(e, "image", "add")}
                            />
                          </label>
                          {projectForm.mediaUrl && (
                            <button
                              type="button"
                              onClick={() => openCropperForExisting(projectForm.mediaUrl, "add")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/20 text-xs font-medium cursor-pointer transition-all"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              {projectForm.coverUrl ? "ویرایش کراپ" : "کراپ کاور"}
                            </button>
                          )}
                        </div>
                        {projectForm.coverUrl && (
                          <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ کاور کراپ شده ثبت شد
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">آدرس ویدیو (اختیاری - Hover-to-Play)</label>
                    <input
                      name="videoUrl" value={projectForm.videoUrl} onChange={handleProjectFormChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none text-sm dir-ltr text-right"
                      placeholder="https://my-videos/vid.mp4"
                    />
                  </div>
                </div>


                {/* ─── MEDIA GALLERY CAROUSEL MANAGER ─── */}
                <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-400">گالری رسانه‌های اسلایدر (پست چندتایی)</label>
                    <span className="text-[10px] text-zinc-500 font-semibold">{projectForm.mediaGallery.length} رسانه اضافه شده</span>
                  </div>

                  {projectForm.mediaGallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {projectForm.mediaGallery.map((item, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center group/galItem">
                          {item.type === "video" ? (
                            <div className="flex flex-col items-center gap-1 text-zinc-500">
                              <Film className="w-6 h-6 text-brand-teal" />
                              <span className="text-[8px] font-bold">ویدیو</span>
                            </div>
                          ) : (
                            <img src={item.url} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="absolute top-1 left-1 p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover/galItem:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-800/50 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      <select
                        value={newMediaItem.type}
                        onChange={e => setNewMediaItem(prev => ({ ...prev, type: e.target.value as any }))}
                        className="col-span-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                      >
                        <option value="image">تصویر</option>
                        <option value="video">ویدیو</option>
                      </select>
                      <input
                        type="text"
                        placeholder="لینک مستقیم یا از دکمه آپلود استفاده کنید..."
                        value={newMediaItem.url}
                        onChange={e => setNewMediaItem(prev => ({ ...prev, url: e.target.value }))}
                        className="col-span-3 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white dir-ltr text-left"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-brand-teal" />
                        آپلود مستقیم
                        <input
                          type="file"
                          accept={newMediaItem.type === "image" ? "image/*" : "video/*"}
                          className="hidden"
                          onChange={handleGalleryFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addGalleryItem}
                        className="px-4 py-2 rounded-xl bg-brand-teal text-black text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        اضافه کردن به اسلایدر
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">رنگ تأکیدی</label>
                  <div className="flex items-center gap-2">
                    {CATEGORY_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        onClick={() => setProjectForm(prev => ({ ...prev, highlightColor: color }))}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer ${projectForm.highlightColor === color ? "ring-2 ring-white scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer"
                >
                  ثبت نمونه‌کار جدید
                </button>
              </form>
            </div>
          )}

          {/* ─────────── SUB-TAB: EDIT PROJECT ─────────── */}
          {activeTab === "projects" && editingProject && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-md">ویرایش پروژه: {editingProject.title}</h3>
                <button
                  type="button" onClick={() => setEditingProject(null)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  انصراف
                </button>
              </div>

              <form onSubmit={handleUpdateProjectSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">عنوان پروژه *</label>
                  <input
                    name="title" value={editingProject.title} onChange={handleEditProjectChange} required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">دسته‌بندی *</label>
                    <select
                      name="category" value={editingProject.category} onChange={handleEditProjectChange} required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none focus:border-brand-orange/50 transition-all text-sm cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">سال اجرا</label>
                    <input
                      name="year" value={editingProject.year || ""} onChange={handleEditProjectChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">کارفرما / مشتری</label>
                  <input
                    name="client" value={editingProject.client || ""} onChange={handleEditProjectChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات کوتاه *</label>
                  <textarea
                    name="description" value={editingProject.description} onChange={handleEditProjectChange} required rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات کامل</label>
                  <textarea
                    name="longDescription" value={editingProject.longDescription} onChange={handleEditProjectChange} rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">برچسب‌ها (با ، جدا کنید)</label>
                    <input
                      name="tags" value={editingProject.tags as any} onChange={handleEditProjectChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">نرم‌افزارها (با ، جدا کنید)</label>
                    <input
                      name="tools" value={editingProject.tools as any} onChange={handleEditProjectChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">تصویر اصلی پروژه *</label>
                    <div className="flex gap-4 items-start">
                      {/* Main image preview */}
                      <div className="shrink-0 space-y-1.5">
                        <p className="text-[10px] text-zinc-500 text-center">تصویر اصلی</p>
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                          {editingProject.mediaUrl ? (
                            <img src={editingProject.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <FileImage className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Cover preview */}
                      {editingProject.mediaUrl && (
                        <div className="shrink-0 space-y-1.5">
                          <p className="text-[10px] text-zinc-500 text-center">کاور کارت</p>
                          <div
                            className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 cursor-pointer hover:border-brand-orange/60 transition-colors"
                            style={{ borderColor: editingProject.coverUrl ? "#ff6b35" : "#3f3f46" }}
                            onClick={() => openCropperForExisting(editingProject.mediaUrl, "edit")}
                            title="کلیک برای ویرایش کراپ"
                          >
                            {editingProject.coverUrl ? (
                              <img src={editingProject.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
                                <Crop className="w-5 h-5" />
                                <span className="text-[8px] font-bold">کراپ کنید</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          name="mediaUrl" value={editingProject.mediaUrl} onChange={handleEditProjectChange} required
                          className="w-full px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-xs dir-ltr text-right focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            تغییر تصویر
                            <input
                              type="file" accept="image/*" className="hidden"
                              onChange={e => handleFileUpload(e, "image", "edit")}
                            />
                          </label>
                          {editingProject.mediaUrl && (
                            <button
                              type="button"
                              onClick={() => openCropperForExisting(editingProject.mediaUrl, "edit")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/20 text-xs font-medium cursor-pointer transition-all"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              {editingProject.coverUrl ? "ویرایش کراپ" : "کراپ کاور"}
                            </button>
                          )}
                        </div>
                        {editingProject.coverUrl && (
                          <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ کاور کراپ شده ثبت شد
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">آدرس ویدیو</label>
                    <input
                      name="videoUrl" value={editingProject.videoUrl || ""} onChange={handleEditProjectChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white focus:outline-none dir-ltr text-right"
                    />
                  </div>
                </div>


                {/* ─── MEDIA GALLERY CAROUSEL MANAGER ─── */}
                <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-400">گالری رسانه‌های اسلایدر (پست چندتایی)</label>
                    <span className="text-[10px] text-zinc-500 font-semibold">{(editingProject.mediaGallery || []).length} رسانه اضافه شده</span>
                  </div>

                  {(editingProject.mediaGallery || []).length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {editingProject.mediaGallery.map((item: any, idx: number) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center group/galItem">
                          {item.type === "video" ? (
                            <div className="flex flex-col items-center gap-1 text-zinc-500">
                              <Film className="w-6 h-6 text-brand-teal" />
                              <span className="text-[8px] font-bold">ویدیو</span>
                            </div>
                          ) : (
                            <img src={item.url} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="absolute top-1 left-1 p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover/galItem:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-800/50 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      <select
                        value={newMediaItem.type}
                        onChange={e => setNewMediaItem(prev => ({ ...prev, type: e.target.value as any }))}
                        className="col-span-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                      >
                        <option value="image">تصویر</option>
                        <option value="video">ویدیو</option>
                      </select>
                      <input
                        type="text"
                        placeholder="لینک مستقیم یا از دکمه آپلود استفاده کنید..."
                        value={newMediaItem.url}
                        onChange={e => setNewMediaItem(prev => ({ ...prev, url: e.target.value }))}
                        className="col-span-3 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white dir-ltr text-left"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-brand-teal" />
                        آپلود مستقیم
                        <input
                          type="file"
                          accept={newMediaItem.type === "image" ? "image/*" : "video/*"}
                          className="hidden"
                          onChange={handleGalleryFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addGalleryItem}
                        className="px-4 py-2 rounded-xl bg-brand-teal text-black text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        اضافه کردن به اسلایدر
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">رنگ تأکیدی</label>
                  <div className="flex items-center gap-2">
                    {CATEGORY_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        onClick={() => setEditingProject((prev: any) => prev ? { ...prev, highlightColor: color } : null)}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer ${editingProject.highlightColor === color ? "ring-2 ring-white scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    ذخیره تغییرات
                  </button>
                  <button
                    type="button" onClick={() => setEditingProject(null)}
                    className="px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                  >
                    لغو
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────── TAB: TIMELINE ─────────── */}
          {activeTab === "timeline" && !isAddingTimeline && !editingTimeline && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-zinc-300">مدیریت سوابق کاری و تحصیلی</h3>
                <button
                  onClick={() => setIsAddingTimeline(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-black text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> افزودن سابقه جدید
                </button>
              </div>

              {timeline.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm font-bold text-white">{item.role}</p>
                      <p className="text-xs text-zinc-400 font-semibold">{item.company} | {item.period}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTimeline({
                        ...item,
                        bulletPoints: Array.isArray(item.bulletPoints) ? item.bulletPoints.join("\n") as any : item.bulletPoints
                      })}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {timelineDeleteConfirm === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDeleteTimelineItem(item.id); setTimelineDeleteConfirm(null); }}
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/35 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTimelineDeleteConfirm(null)}
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setTimelineDeleteConfirm(item.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-650 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─────────── SUB-TAB: ADD TIMELINE ─────────── */}
          {activeTab === "timeline" && isAddingTimeline && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-md">ثبت سابقه کاری جدید</h3>
                <button
                  type="button" onClick={() => setIsAddingTimeline(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  بازگشت
                </button>
              </div>

              <form onSubmit={handleAddTimelineSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">نام آژانس / شرکت *</label>
                    <input
                      name="company" value={timelineForm.company} onChange={handleTimelineFormChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                      placeholder="چاپ هنر پارسی"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">نقش / سمت *</label>
                    <input
                      name="role" value={timelineForm.role} onChange={handleTimelineFormChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                      placeholder="طراح ارشد گرافیک"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">دوره زمانی *</label>
                  <input
                    name="period" value={timelineForm.period} onChange={handleTimelineFormChange} required
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                    placeholder="۱۴۰۲ - ۱۴۰۵ (اکنون)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات خلاصه</label>
                  <textarea
                    name="description" value={timelineForm.description} onChange={handleTimelineFormChange} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none resize-none"
                    placeholder="شرح کلی وظایف..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">دستاوردهای کلیدی (هر مورد در یک خط) *</label>
                  <textarea
                    name="bulletPoints" value={timelineForm.bulletPoints} onChange={handleTimelineFormChange} required rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none resize-none"
                    placeholder="دستاورد ۱&#10;دستاورد ۲&#10;دستاورد ۳"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">رنگ شاخص سابقه</label>
                  <div className="flex items-center gap-2">
                    {CATEGORY_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        onClick={() => setTimelineForm(prev => ({ ...prev, color: color }))}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer ${timelineForm.color === color ? "ring-2 ring-white scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-orange text-black font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer"
                >
                  ثبت سابقه کاری جدید
                </button>
              </form>
            </div>
          )}

          {/* ─────────── SUB-TAB: EDIT TIMELINE ─────────── */}
          {activeTab === "timeline" && editingTimeline && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-md">ویرایش سابقه کاری: {editingTimeline.company}</h3>
                <button
                  type="button" onClick={() => setEditingTimeline(null)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  انصراف
                </button>
              </div>

              <form onSubmit={handleUpdateTimelineSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">نام آژانس / شرکت *</label>
                    <input
                      name="company" value={editingTimeline.company} onChange={handleEditTimelineChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">نقش / سمت *</label>
                    <input
                      name="role" value={editingTimeline.role} onChange={handleEditTimelineChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">دوره زمانی *</label>
                  <input
                    name="period" value={editingTimeline.period} onChange={handleEditTimelineChange} required
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">توضیحات خلاصه</label>
                  <textarea
                    name="description" value={editingTimeline.description} onChange={handleEditTimelineChange} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">دستاوردهای کلیدی (هر مورد در یک خط) *</label>
                  <textarea
                    name="bulletPoints" value={editingTimeline.bulletPoints as any} onChange={handleEditTimelineChange} required rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">رنگ شاخص سابقه</label>
                  <div className="flex items-center gap-2">
                    {CATEGORY_COLORS.map(color => (
                      <button
                        key={color} type="button"
                        onClick={() => setEditingTimeline(prev => prev ? { ...prev, color: color } : null)}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer ${editingTimeline.color === color ? "ring-2 ring-white scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    ذخیره تغییرات
                  </button>
                  <button
                    type="button" onClick={() => setEditingTimeline(null)}
                    className="px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                  >
                    لغو
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────── TAB: SETTINGS ─────────── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 mb-2">تنظیمات اطلاعات عمومی سایت</h3>
              
              <form onSubmit={handleSettingsSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">نام کامل شما</label>
                    <input
                      value={settingsForm.name}
                      onChange={e => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">سال‌های تجربه کاری</label>
                    <input
                      value={settingsForm.workExperienceYears}
                      onChange={e => setSettingsForm(prev => ({ ...prev, workExperienceYears: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">عنوان حرفه‌ای (هیرو)</label>
                  <input
                    value={settingsForm.title}
                    onChange={e => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400">بیوگرافی کوتاه (هیرو)</label>
                  <textarea
                    value={settingsForm.bio}
                    onChange={e => setSettingsForm(prev => ({ ...prev, bio: e.target.value }))}
                    required rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">ایمیل تماس</label>
                    <input
                      value={settingsForm.email}
                      onChange={e => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none dir-ltr text-left"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">تلفن تماس</label>
                    <input
                      value={settingsForm.phone}
                      onChange={e => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none dir-ltr text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">لینک اینستاگرام</label>
                    <input
                      value={settingsForm.instagram}
                      onChange={e => setSettingsForm(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none dir-ltr text-left"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400">لینک تلگرام</label>
                    <input
                      value={settingsForm.telegram}
                      onChange={e => setSettingsForm(prev => ({ ...prev, telegram: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none dir-ltr text-left"
                    />
                  </div>
                </div>

                {/* Resume PDF Upload */}
                <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                  <label className="block text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-teal" />
                    فایل رزومه کاری (PDF)
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      value={settingsForm.resumeFileUrl}
                      onChange={e => setSettingsForm(prev => ({ ...prev, resumeFileUrl: e.target.value }))}
                      required
                      className="flex-1 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-xs dir-ltr text-left focus:outline-none"
                    />
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      آپلود PDF جدید
                      <input
                        type="file" accept=".pdf" className="hidden"
                        onChange={e => handleFileUpload(e, "pdf", "settings")}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer"
                >
                  ذخیره تنظیمات سایت
                </button>
              </form>
            </div>
          )}

          {/* ─────────── TAB: CATEGORIES ─────────── */}
          {activeTab === "categories" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-300">دسته‌بندی‌های فعال</h3>
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div>
                        <p className="text-sm font-semibold text-white">{cat.label}</p>
                        <p className="text-xs text-zinc-500 font-mono">{cat.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {projects.filter(p => p.category === cat.value).length} پروژه
                      </span>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-650 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-brand-teal" />
                  افزودن دسته‌بندی جدید
                </h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs text-zinc-500 font-semibold">عنوان فارسی *</label>
                      <input
                        value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none"
                        placeholder="طراحی رابط کاربری"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-zinc-500 font-semibold">شناسه انگلیسی *</label>
                      <input
                        value={newCatValue} onChange={e => setNewCatValue(e.target.value.toLowerCase().replace(/\s/g, "-"))} required
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none dir-ltr text-left"
                        placeholder="ui-design"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs text-zinc-500 font-semibold">رنگ دسته‌بندی</label>
                    <div className="flex items-center gap-2.5">
                      {CATEGORY_COLORS.map(color => (
                        <button
                          key={color} type="button"
                          onClick={() => setNewCatColor(color)}
                          className={`w-7 h-7 rounded-full transition-all cursor-pointer ${newCatColor === color ? "ring-2 ring-white scale-110" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-teal text-black font-bold text-sm hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> افزودن دسته‌بندی
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

    {cropperOpen && cropperImageUrl && (
      <ImageCropper
        imageUrl={cropperImageUrl}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperOpen(false)}
      />
    )}
    </>
  );
}
