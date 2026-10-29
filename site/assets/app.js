/* =========================================================
   Portfolio v2 — app logic (vanilla, zero dependencies)
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Persian helpers ---------- */
  const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (v) => String(v).replace(/\d/g, (d) => FA[+d]);

  /* ---------- Telegram ---------- */
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const isMiniApp = !!(tg && tg.initData !== undefined && tg.platform && tg.platform !== "unknown");
  const haptic = (style) => {
    try { if (tg && tg.HapticFeedback && isMiniApp) tg.HapticFeedback.impactOccurred(style || "light"); } catch (e) {}
  };

  if (isMiniApp) {
    document.body.classList.add("tg");
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor("#06070a");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#06070a");
      const sa = tg.contentSafeAreaInset || tg.safeAreaInset;
      if (sa) {
        document.documentElement.style.setProperty("--tg-safe-top", (sa.top || 0) + "px");
        document.documentElement.style.setProperty("--tg-safe-bottom", (sa.bottom || 0) + "px");
      }
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
    } catch (e) {}
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealIO.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  function observeReveals() {
    $$(".reveal:not(.in)").forEach((el) => revealIO.observe(el));
    $$(".card:not(.in)").forEach((el) => revealIO.observe(el));
    $$(".tl-item:not(.in)").forEach((el) => revealIO.observe(el));
  }

  /* ---------- Counters ---------- */
  function animateCount(el, target, suffix) {
    const start = performance.now();
    const dur = 1300;
    function frame(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = toFa(Math.round(target * eased)) + (suffix || "");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10);
        animateCount(el, target, el.dataset.suffix || "");
        countIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  /* ---------- Progress + nav state ---------- */
  const nav = $("#nav");
  const bar = $("#progressBar");
  const sections = ["home", "work", "about", "resume", "contact"];

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = Math.min(100, (y / Math.max(1, h)) * 100) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 24);

    let current = "home";
    sections.forEach((id) => {
      const sec = document.getElementById(id);
      if (sec && sec.getBoundingClientRect().top <= 140) current = id;
    });

    $$("#navLinks a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    $$(".tab").forEach((a) => a.classList.toggle("active", a.dataset.tab === current));
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- Portrait tilt ---------- */
  const portrait = $("#portrait");
  if (portrait && window.matchMedia("(hover:hover) and (min-width:900px)").matches) {
    const wrap = portrait.parentElement;
    wrap.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateZ(0)`;
    });
    wrap.addEventListener("mouseleave", () => (portrait.style.transform = ""));
  }

  /* =========================================================
     DATA
     ========================================================= */
  const state = { data: null, filter: "all", projects: [], lbIndex: 0, lbGallery: [] };

  fetch("data.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("data");
      return r.json();
    })
    .then((data) => {
      state.data = data;
      state.projects = (data.projects || []).slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      buildMarquee();
      buildStats();
      buildFilters();
      renderGrid();
      buildTimeline();
      buildContact();
      observeReveals();
      onScroll();
    })
    .catch(() => {
      const grid = $("#grid");
      if (grid) grid.innerHTML = '<div class="empty">بارگذاری داده‌ها ناموفق بود. صفحه را دوباره باز کنید.</div>';
    });

  /* ---------- Marquee ---------- */
  function buildMarquee() {
    const track = $("#marqueeTrack");
    if (!track) return;
    const words = [
      "هویت بصری", "طراحی چاپ", "لارج‌فرمت", "موشن‌گرافیک", "تدوین ویدیو",
      "تیزر تبلیغاتی", "لیبل و بسته‌بندی", "منو و کاتالوگ", "ریلز اینستاگرام",
      "هوش مصنوعی", "بنر و تابلو", "کارت ویزیت"
    ];
    const chunk = words.map((w) => `<span>${w}</span>`).join("");
    track.innerHTML = chunk + chunk;
  }

  /* ---------- Stats ---------- */
  function buildStats() {
    const el = $("#stats");
    if (!el) return;
    const p = state.data.projects || [];
    const videos = p.reduce((n, x) => n + (x.gallery || []).filter((g) => g.type === "video").length, 0);
    const cats = (state.data.categories || []).filter((c) => p.some((x) => x.category === c.value)).length;
    const items = [
      { n: 6, s: "+", l: "سال تجربه حرفه‌ای" },
      { n: p.length, s: "", l: "پروژه منتشرشده" },
      { n: videos, s: "", l: "ویدیو و موشن" },
      { n: cats, s: "", l: "حوزه تخصصی" }
    ];
    el.innerHTML = items
      .map(
        (i) =>
          `<div class="stat"><b data-count="${i.n}" data-suffix="${i.s}">۰</b><span>${i.l}</span></div>`
      )
      .join("");
    $$("[data-count]").forEach((b) => countIO.observe(b));
  }

  /* ---------- Filters ---------- */
  function buildFilters() {
    const el = $("#filters");
    if (!el) return;
    const p = state.data.projects || [];
    const cats = (state.data.categories || []).filter((c) => p.some((x) => x.category === c.value));
    const total = p.length;
    let html = `<button class="filter on" data-cat="all" role="tab">همه <em>${toFa(total)}</em></button>`;
    cats.forEach((c) => {
      const n = p.filter((x) => x.category === c.value).length;
      html += `<button class="filter" data-cat="${c.value}" role="tab">${c.label} <em>${toFa(n)}</em></button>`;
    });
    el.innerHTML = html;

    el.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      state.filter = btn.dataset.cat;
      $$(".filter", el).forEach((b) => b.classList.toggle("on", b === btn));
      haptic("soft");
      renderGrid();
    });
  }

  /* ---------- Grid ---------- */
  function mediaCount(p) {
    return (p.gallery || []).length;
  }

  function renderGrid() {
    const grid = $("#grid");
    if (!grid) return;
    const list = state.filter === "all" ? state.projects : state.projects.filter((p) => p.category === state.filter);

    if (!list.length) {
      grid.innerHTML = '<div class="empty">کاری در این دسته پیدا نشد.</div>';
      return;
    }

    grid.innerHTML = list
      .map((p, i) => {
        const hasVideo = (p.gallery || []).some((g) => g.type === "video") || (p.media || "").match(/\.(mp4|webm)$/i);
        const wide = i === 0 && state.filter === "all" ? " wide" : "";
        const n = mediaCount(p);
        return `
        <article class="card${wide}" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.title}">
          <img src="${p.cover}" alt="${p.title}" loading="${i < 3 ? "eager" : "lazy"}" decoding="async"
               onerror="this.style.display='none'" />
          <div class="veil"></div>
          ${hasVideo ? `<span class="play-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ویدیو</span>` : ""}
          <span class="card-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
          <div class="card-body">
            <span class="card-cat">${p.categoryLabel || ""}</span>
            <h3>${p.title}</h3>
            <p>${p.description || ""}</p>
            <div class="card-meta">
              ${p.client ? `<span>${p.client}</span><i></i>` : ""}
              ${p.year ? `<span>${toFa(p.year)}</span><i></i>` : ""}
              <span>${toFa(n)} فایل</span>
            </div>
          </div>
        </article>`;
      })
      .join("");

    const cards = $$(".card", grid);
    cards.forEach((c, i) => {
      c.style.transitionDelay = (i % 3) * 70 + "ms";
      c.addEventListener("click", () => openProject(c.dataset.id));
      c.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject(c.dataset.id);
        }
      });
      revealIO.observe(c);
    });
    onScroll();
  }

  /* ---------- Timeline ---------- */
  function buildTimeline() {
    const el = $("#timeline");
    if (!el || !state.data.timeline) return;
    el.innerHTML = state.data.timeline
      .map(
        (t) => `
      <div class="tl-item">
        <span class="tl-dot" style="border-color:${t.color || "#ff6b35"}"></span>
        <div class="tl-card">
          <div class="tl-top">
            <h3>${t.company}</h3>
            <span class="tl-period">${t.period}</span>
          </div>
          <div class="tl-role">${t.role}</div>
          <p class="tl-desc">${t.description || ""}</p>
          ${
            t.bulletPoints && t.bulletPoints.length
              ? `<ul class="tl-points">${t.bulletPoints.map((b) => `<li>${b}</li>`).join("")}</ul>`
              : ""
          }
        </div>
      </div>`
      )
      .join("");
    $$(".tl-item", el).forEach((i) => revealIO.observe(i));
  }

  /* ---------- Contact ---------- */
  function buildContact() {
    const el = $("#contactGrid");
    if (!el) return;
    const p = state.data.profile;
    const icon = {
      tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2L7.1 13.1 2.5 11.7c-1-.3-1-1 .2-1.5l17.7-6.8c.9-.3 1.6.2 1.5.9z"/></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m3 6 9 7 9-7"/></svg>',
      phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
      ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'
    };
    const rows = [
      { k: "تلگرام", v: "@B4BACK", href: p.telegram, ico: icon.tg },
      { k: "ایمیل", v: p.email, href: "mailto:" + p.email, ico: icon.mail, copy: p.email },
      { k: "شماره تماس", v: toFa(p.phone), href: "tel:" + p.phone, ico: icon.phone, copy: p.phone, rtl: true },
      { k: "اینستاگرام", v: "@babakzangenemohebi", href: p.instagram, ico: icon.ig }
    ];
    el.innerHTML = rows
      .map(
        (r) => `
      <a class="c-item${r.rtl ? " rtl" : ""}" href="${r.href}" ${r.copy ? `data-copy="${r.copy}"` : 'target="_blank" rel="noopener"'}>
        <span class="c-ico">${r.ico}</span>
        <span style="flex:1;min-width:0">
          <span class="c-k">${r.k}</span>
          <span class="c-v" style="display:block;overflow:hidden;text-overflow:ellipsis">${r.v}</span>
        </span>
        ${
          r.copy
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="opacity:.5"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="opacity:.5"><path d="M7 17 17 7M9 7h8v8"/></svg>'
        }
      </a>`
      )
      .join("");

    $$("[data-copy]", el).forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const val = a.dataset.copy;
        const done = () => toast("کپی شد: " + (/\d/.test(val) ? toFa(val) : val));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(done).catch(() => (window.location.href = a.getAttribute("href")));
        } else {
          window.location.href = a.getAttribute("href");
        }
        haptic("medium");
      });
    });
  }

  /* =========================================================
     LIGHTBOX
     ========================================================= */
  const lb = $("#lb");
  const lbStage = $("#lbStage");
  const lbThumbs = $("#lbThumbs");

  function projectGallery(p) {
    const g = (p.gallery || []).filter((x) => x.url);
    if (g.length) return g;
    return [{ type: "image", url: p.cover }];
  }

  function openProject(id) {
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    state.lbGallery = projectGallery(p);
    state.lbIndex = 0;
    state.lbProject = p;

    $("#lbTitle").textContent = p.title;
    $("#lbCat").textContent = p.categoryLabel || "";
    $("#lbDesc").textContent = p.longDescription || p.description || "";
    $("#lbSpecs").innerHTML = [
      p.client ? `<div class="spec"><span>کارفرما</span><b>${p.client}</b></div>` : "",
      p.year ? `<div class="spec"><span>سال</span><b>${toFa(p.year)}</b></div>` : "",
      p.tools && p.tools.length ? `<div class="spec"><span>ابزارها</span><b>${p.tools.join("، ")}</b></div>` : "",
      `<div class="spec"><span>تعداد فایل</span><b>${toFa(state.lbGallery.length)}</b></div>`
    ]
      .filter(Boolean)
      .join("");

    lbThumbs.innerHTML = state.lbGallery
      .map(
        (g, i) => `
        <button class="thumb" data-i="${i}" aria-label="فایل ${i + 1}">
          <img src="${g.type === "video" ? p.cover : g.url}" alt="" loading="lazy" />
          ${g.type === "video" ? '<span class="vmark">▶</span>' : ""}
        </button>`
      )
      .join("");

    $$(".thumb", lbThumbs).forEach((b) =>
      b.addEventListener("click", () => {
        state.lbIndex = +b.dataset.i;
        renderSlide();
        haptic("light");
      })
    );

    lb.classList.add("open");
    document.body.classList.add("locked");
    renderSlide();

    if (isMiniApp && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(closeLb);
    }
    haptic("medium");
  }

  function renderSlide() {
    const p = state.lbProject;
    const g = state.lbGallery[state.lbIndex];
    if (!g) return;
    if (g.type === "video") {
      lbStage.querySelectorAll("img,video").forEach((n) => n.remove());
      const v = document.createElement("video");
      v.src = g.url;
      v.controls = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "metadata";
      v.setAttribute("playsinline", "");
      v.poster = p.cover || "";
      lbStage.insertBefore(v, lbStage.firstChild);
    } else {
      lbStage.querySelectorAll("img,video").forEach((n) => n.remove());
      const img = document.createElement("img");
      img.src = g.url;
      img.alt = p.title;
      img.decoding = "async";
      lbStage.insertBefore(img, lbStage.firstChild);
    }
    $("#lbCount").textContent = toFa(state.lbIndex + 1) + " / " + toFa(state.lbGallery.length);
    $$(".thumb", lbThumbs).forEach((b, i) => b.classList.toggle("on", i === state.lbIndex));
    const on = lbThumbs.children[state.lbIndex];
    if (on) on.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    const multi = state.lbGallery.length > 1;
    $("#lbPrev").style.display = multi ? "" : "none";
    $("#lbNext").style.display = multi ? "" : "none";
  }

  function step(dir) {
    const n = state.lbGallery.length;
    if (!n) return;
    state.lbIndex = (state.lbIndex + dir + n) % n;
    renderSlide();
    haptic("light");
  }

  function closeLb() {
    lb.classList.remove("open");
    document.body.classList.remove("locked");
    lbStage.querySelectorAll("video").forEach((v) => v.pause());
    if (isMiniApp && tg.BackButton) {
      tg.BackButton.offClick(closeLb);
      tg.BackButton.hide();
    }
  }

  if (lb) {
    $("#lbClose").addEventListener("click", closeLb);
    $("#lbPrev").addEventListener("click", () => step(-1));
    $("#lbNext").addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    });

    let sx = 0, sy = 0;
    lbStage.addEventListener("touchstart", (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });
    lbStage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) step(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  /* ---------- Smooth anchor scroll ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (id === "home" ? 0 : 54);
      window.scrollTo({ top, behavior: "smooth" });
      haptic("light");
    });
  });

  /* ---------- Offline / installable ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ---------- Boot ---------- */
  onScroll();
  observeReveals();
  setTimeout(observeReveals, 700);
})();
