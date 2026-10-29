/* =========================================================
   Blurred 3D objects — the "liquid glass" backdrop.
   Self-hosted three.js, no CDN, no post-processing:
   the softness comes from a CSS blur on the canvas, which is
   far cheaper on mobile GPUs than a real DoF pass.
   ========================================================= */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("bg3d");
if (canvas) boot();

function boot() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = innerWidth < 760;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    canvas.style.display = "none"; // no WebGL → CSS orbs remain
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isSmall ? 1 : 1.4));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  /* ---- palette ---- */
  const palette = [0x22d3ee, 0x6366f1, 0xa855f7, 0x2dd4bf, 0x38bdf8, 0xf472b6];

  /* ---- lights ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const l1 = new THREE.PointLight(0x22d3ee, 260, 60, 2);
  l1.position.set(-9, 7, 9);
  const l2 = new THREE.PointLight(0xa855f7, 220, 60, 2);
  l2.position.set(9, -6, 7);
  const l3 = new THREE.PointLight(0xffffff, 90, 60, 2);
  l3.position.set(0, 0, 14);
  scene.add(l1, l2, l3);

  /* ---- geometry set ---- */
  const geo = [
    new THREE.IcosahedronGeometry(1.55, 1),
    new THREE.TorusGeometry(1.25, 0.44, 48, 96),
    new THREE.TorusKnotGeometry(1.0, 0.34, 96, 16),
    new THREE.SphereGeometry(1.35, 48, 48),
    new THREE.CapsuleGeometry(0.62, 1.3, 8, 24),
    new THREE.BoxGeometry(1.9, 1.9, 1.9, 1, 1, 1),
  ];

  const shapes = [];
  const spots = [
    [-5.2, 2.3, -1.5],
    [4.6, 2.9, -2.5],
    [5.6, -2.6, -0.5],
    [-4.4, -3.1, -1.0],
    [0.4, 3.6, -4.5],
    [-1.2, -3.8, -3.2],
  ];

  geo.forEach((g, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: palette[i % palette.length],
      roughness: 0.22,
      metalness: 0.55,
      emissive: new THREE.Color(palette[i % palette.length]).multiplyScalar(0.22),
      flatShading: i === 0 || i === 5,
    });
    const mesh = new THREE.Mesh(g, mat);
    const [x, y, z] = spots[i];
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      base: new THREE.Vector3(x, y, z),
      speed: 0.12 + Math.random() * 0.16,
      phase: Math.random() * Math.PI * 2,
      spin: 0.06 + Math.random() * 0.1,
      drift: 0.35 + Math.random() * 0.5,
    };
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* ---- pointer parallax ---- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener(
    "pointermove",
    (e) => {
      pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  /* ---- render loop ---- */
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;

  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    camera.position.x = pointer.x * 0.9;
    camera.position.y = -pointer.y * 0.7;
    camera.lookAt(0, 0, 0);

    shapes.forEach((m, i) => {
      const d = m.userData;
      m.rotation.x += d.spin * 0.006;
      m.rotation.y += d.spin * 0.009;
      m.position.y = d.base.y + Math.sin(t * d.speed + d.phase) * d.drift;
      m.position.x = d.base.x + Math.cos(t * d.speed * 0.7 + d.phase) * d.drift * 0.6;
    });

    l1.position.x = -9 + Math.sin(t * 0.25) * 3;
    l2.position.y = -6 + Math.cos(t * 0.2) * 3;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  if (reduce) {
    renderer.render(scene, camera); // one static frame
  } else {
    raf = requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!reduce && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  });
}
