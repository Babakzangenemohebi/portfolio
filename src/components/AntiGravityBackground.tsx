"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  speedX: number;
  speedY: number;
  angle: number;
  spin: number;
  opacity: number;
  type: "circle" | "square" | "triangle";
  color: string;
}

export default function AntiGravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const colors = [
      "rgba(255, 107, 53, 0.4)", // Brand Orange
      "rgba(0, 173, 181, 0.4)",  // Brand Teal
      "rgba(255, 255, 255, 0.25)", // Soft White
      "rgba(100, 116, 139, 0.2)", // Muted Slate
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 100);

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 8 + 3;
        const types: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"];
        const type = types[Math.floor(Math.random() * types.length)];
        
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          size,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4 - 0.2, // Drift slightly upwards (anti-gravity)
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.01,
          opacity: Math.random() * 0.5 + 0.15,
          type,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const drawShape = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.size * 1.5;
      ctx.shadowColor = p.color;

      ctx.beginPath();
      if (p.type === "circle") {
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      } else if (p.type === "square") {
        ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === "triangle") {
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
      }
      ctx.fill();
      ctx.restore();
    };

    const updateParticles = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Natural drift
        p.originX += p.speedX;
        p.originY += p.speedY;
        p.angle += p.spin;

        // Wrap around boundaries
        if (p.originX < -20) p.originX = canvas.width + 20;
        if (p.originX > canvas.width + 20) p.originX = -20;
        if (p.originY < -20) p.originY = canvas.height + 20;
        if (p.originY > canvas.height + 20) p.originY = -20;

        let targetX = p.originX;
        let targetY = p.originY;

        // Interactive mouse force (Anti-gravity push)
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
            // Push away
            const angle = Math.atan2(dy, dx);
            targetX += Math.cos(angle) * force * 60;
            targetY += Math.sin(angle) * force * 60;
          }
        }

        // Smooth physics-based interpolation
        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;

        drawShape(ctx, p);
      });

      // Draw subtle connection lines between nearby particles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    resizeCanvas();
    updateParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-[#070709]"
    />
  );
}
