"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpLeft, Sun, Moon } from "lucide-react";
import gsap from "gsap";

interface NavItem {
  label: string;
  id: string;
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const navItems: NavItem[] = [
    { label: "خانه", id: "home" },
    { label: "درباره من", id: "about" },
    { label: "نمونه‌کارها", id: "portfolio" },
    { label: "سوابق و مهارت‌ها", id: "experience" },
    { label: "تماس", id: "contact" },
  ];

  // Load and apply theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("portfolio-theme") as "dark" | "light" | null;
      const currentTheme = savedTheme || "dark";
      setTheme(currentTheme);
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio-theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    }
  };

  // GSAP Entrance animation
  useEffect(() => {
    gsap.fromTo(
      ".nav-capsule",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
    );
  }, []);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      {/* Desktop Capsule Nav */}
      <nav className="nav-capsule hidden md:flex items-center justify-between w-full max-w-4xl px-8 py-3 rounded-full glass-nav shadow-lg">
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
          </span>
          <span className="font-bold tracking-wider text-white text-lg hover:text-brand-orange transition-colors">
            بابک زنگنه محبی
          </span>
        </div>

        {/* Links */}
        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                  activeSection === item.id
                    ? "text-brand-orange bg-white/5 shadow-[0_0_15px_-3px_rgba(255,107,53,0.1)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Button & Theme Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/5 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? "حالت روز" : "حالت شب"}
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> : <Moon className="w-4.5 h-4.5 text-indigo-400" />}
          </button>
          
          <button
            onClick={() => scrollToSection("contact")}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-brand-orange to-[#ff8452] text-black hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            همکاری با من
            <ArrowUpLeft className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Bar */}
      <div className="nav-capsule flex md:hidden items-center justify-between w-full rounded-3xl px-6 py-3.5 glass shadow-lg">
        <div className="flex items-center gap-2" onClick={() => scrollToSection("home")}>
          <span className="font-bold text-sm tracking-wider text-white">بابک زنگنه</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? "حالت روز" : "حالت شب"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 z-40 md:hidden p-6 rounded-3xl glass shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300">
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-right px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                    activeSection === item.id
                      ? "text-brand-orange bg-brand-orange/10 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollToSection("contact")}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-orange text-black font-semibold text-sm cursor-pointer"
          >
            همکاری با من
            <ArrowUpLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
