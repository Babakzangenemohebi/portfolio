#!/usr/bin/env node
/**
 * db.json  ->  site/data.json
 *
 * db.json is the single source of truth for content (projects, categories,
 * timeline, profile). The website reads site/data.json at runtime, so after
 * editing db.json just run:
 *
 *    node scripts/build-data.mjs
 *
 * (no dependencies, plain Node 18+)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "db.json");
const outPath = join(root, "site", "data.json");

if (!existsSync(dbPath)) {
  console.error("db.json not found at", dbPath);
  process.exit(1);
}

const db = JSON.parse(readFileSync(dbPath, "utf8"));
const clean = (u) => (u || "").replace(/^\/+/, "");

const projects = (db.projects || []).map((p) => {
  const gallery = (p.mediaGallery || []).filter((g) => g && g.url);
  return {
    id: p.id,
    title: (p.title || "").trim(),
    category: p.category,
    categoryLabel: p.categoryLabel || "",
    description: p.description || "",
    longDescription: p.longDescription || "",
    tools: p.tools || [],
    client: p.client || "",
    year: p.year || "",
    cover: clean(p.coverUrl || p.mediaUrl),
    media: clean(p.mediaUrl),
    gallery: gallery.map((g) => ({ type: g.type, url: clean(g.url) })),
    featured: !!p.featured,
    color: p.highlightColor || "#ff6b35",
  };
});

const s = db.settings || {};
const data = {
  profile: {
    name: s.name || "",
    title: s.title || "",
    bio: s.bio || "",
    email: s.email || "",
    phone: s.phone || "",
    instagram: s.instagram || "",
    telegram: s.telegram || "",
    years: s.workExperienceYears || "",
    resume: clean(s.resumeFileUrl),
    avatar: "images/babak.jpg",
  },
  categories: db.categories || [],
  projects,
  timeline: db.timeline || [],
};

writeFileSync(outPath, JSON.stringify(data, null, 1), "utf8");

const videos = projects.reduce((n, p) => n + p.gallery.filter((g) => g.type === "video").length, 0);
console.log(`✓ site/data.json — ${projects.length} projects, ${videos} videos, ${data.timeline.length} timeline entries`);
