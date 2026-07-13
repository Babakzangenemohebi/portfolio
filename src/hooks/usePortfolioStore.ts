"use client";

import { useState, useEffect, useCallback } from "react";
import { Project } from "@/data/projects";

export interface Category {
  id: string;
  label: string;
  value: string;
  color: string;
}

export interface ManagedProject extends Project {
  visible: boolean; // Show on homepage
  featured: boolean; // Featured / pinned
}

export interface GeneralSettings {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  instagram: string;
  telegram: string;
  workExperienceYears: string;
  resumeFileUrl: string;
}

export interface TimelineItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  bulletPoints: string[];
  color: string;
}

const STORAGE_KEY_TOKEN = "babak_admin_token";

const DEFAULT_SETTINGS: GeneralSettings = {
  name: "بابک زنگنه محبی",
  title: "معمار بصری، تدوینگر و تولیدکننده محتوا",
  bio: "من زبان برندها را به «حرکت» و «تصویر» تبدیل می‌کنم.",
  email: "babakzangenemohebi@gmail.com",
  phone: "09120000000",
  instagram: "https://instagram.com/babakzangenemohebi",
  telegram: "https://t.me/B4BACK",
  workExperienceYears: "۵+",
  resumeFileUrl: "/resume.pdf",
};

export function usePortfolioStore() {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedToken) setToken(storedToken);
    }
  }, []);

  // Fetch initial data from server
  const fetchData = useCallback(async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const [resProjects, resCategories, resSettings, resTimeline] = await Promise.all([
        fetch(`${basePath}/api/projects`),
        fetch(`${basePath}/api/categories`),
        fetch(`${basePath}/api/settings`),
        fetch(`${basePath}/api/timeline`),
      ]);

      if (resProjects.ok && resCategories.ok && resSettings.ok && resTimeline.ok) {
        const projectsData = await resProjects.json();
        const categoriesData = await resCategories.json();
        const settingsData = await resSettings.json();
        const timelineData = await resTimeline.json();

        // Patch media and asset URLs with basePath if they are root-relative
        const patchUrl = (url?: string) => {
          if (!url) return "";
          if (url.startsWith("/") && !url.startsWith(basePath + "/")) {
            return `${basePath}${url}`;
          }
          return url;
        };

        const patchedProjects = (projectsData || []).map((p: any) => ({
          ...p,
          mediaUrl: patchUrl(p.mediaUrl),
          coverUrl: patchUrl(p.coverUrl),
          mediaGallery: (p.mediaGallery || []).map((item: any) => ({
            ...item,
            url: patchUrl(item.url),
          })),
        }));

        const patchedSettings = {
          ...settingsData,
          resumeFileUrl: patchUrl(settingsData.resumeFileUrl),
        };

        setProjects(patchedProjects);
        setCategories(categoriesData);
        setSettings(patchedSettings);
        setTimeline(timelineData);
      }
    } catch (error) {
      console.error("Failed to fetch data from API", error);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auth helper headers
  const getHeaders = useCallback(() => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_TOKEN) : null);
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${activeToken || ""}`,
    };
  }, [token]);

  // --- Project Actions ---

  const addProject = useCallback(
    async (project: Omit<ManagedProject, "id">) => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(project),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to add project", error);
      }
    },
    [fetchData, getHeaders]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    },
    [fetchData, getHeaders]
  );

  const toggleVisibility = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ visible: !project.visible }),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to toggle visibility", error);
      }
    },
    [projects, fetchData, getHeaders]
  );

  const toggleFeatured = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ featured: !project.featured }),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to toggle featured", error);
      }
    },
    [projects, fetchData, getHeaders]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<ManagedProject>) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(updates),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to update project", error);
      }
    },
    [fetchData, getHeaders]
  );

  // --- Category Actions ---

  const addCategory = useCallback(
    async (cat: Omit<Category, "id">) => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(cat),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to add category", error);
      }
    },
    [fetchData, getHeaders]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    },
    [fetchData, getHeaders]
  );

  // --- General Settings Action ---

  const updateSettings = useCallback(
    async (updates: Partial<GeneralSettings>) => {
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(updates),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to update settings", error);
      }
    },
    [fetchData, getHeaders]
  );

  // --- Timeline Actions ---

  const addTimelineItem = useCallback(
    async (item: Omit<TimelineItem, "id">) => {
      try {
        const res = await fetch("/api/timeline", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(item),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to add timeline item", error);
      }
    },
    [fetchData, getHeaders]
  );

  const updateTimelineItem = useCallback(
    async (id: string, updates: Partial<TimelineItem>) => {
      try {
        const res = await fetch(`/api/timeline/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(updates),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to update timeline item", error);
      }
    },
    [fetchData, getHeaders]
  );

  const deleteTimelineItem = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/timeline/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (res.ok) await fetchData();
      } catch (error) {
        console.error("Failed to delete timeline item", error);
      }
    },
    [fetchData, getHeaders]
  );

  const resetToDefaults = useCallback(async () => {
    try {
      const res = await fetch("/api/projects/reset", {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Failed to reset defaults", error);
    }
  }, [fetchData, getHeaders]);

  const setAdminToken = useCallback((newToken: string | null) => {
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
    setToken(newToken);
  }, []);

  const visibleProjects = projects.filter((p) => p.visible);

  return {
    projects,
    visibleProjects,
    categories,
    settings,
    timeline,
    initialized,
    token,
    setAdminToken,
    addProject,
    deleteProject,
    toggleVisibility,
    toggleFeatured,
    updateProject,
    addCategory,
    deleteCategory,
    updateSettings,
    addTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    resetToDefaults,
  };
}
