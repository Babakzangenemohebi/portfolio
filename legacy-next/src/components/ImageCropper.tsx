"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, Crop, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onClose: () => void;
  aspectRatio?: number; // e.g. 4/3, 16/9 or undefined for free
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onClose,
  aspectRatio,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [crop, setCrop] = useState<CropArea>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  // crop coords are normalized 0..1 relative to displayed image

  const [isResizing, setIsResizing] = useState<string | null>(null); // handle name
  const [dragStartCrop, setDragStartCrop] = useState<CropArea | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const HANDLE_SIZE = 10;

  // Draw everything on the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Draw image
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);

    // Dim outside crop
    const cx = crop.x * cw;
    const cy = crop.y * ch;
    const cWidth = crop.width * cw;
    const cHeight = crop.height * ch;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, cw, cy);
    ctx.fillRect(0, cy + cHeight, cw, ch - (cy + cHeight));
    ctx.fillRect(0, cy, cx, cHeight);
    ctx.fillRect(cx + cWidth, cy, cw - (cx + cWidth), cHeight);

    // Crop border
    ctx.strokeStyle = "#ff6b35";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cx, cy, cWidth, cHeight);

    // Rule of thirds lines
    ctx.strokeStyle = "rgba(255,107,53,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + cWidth / 3, cy);
    ctx.lineTo(cx + cWidth / 3, cy + cHeight);
    ctx.moveTo(cx + (2 * cWidth) / 3, cy);
    ctx.lineTo(cx + (2 * cWidth) / 3, cy + cHeight);
    ctx.moveTo(cx, cy + cHeight / 3);
    ctx.lineTo(cx + cWidth, cy + cHeight / 3);
    ctx.moveTo(cx, cy + (2 * cHeight) / 3);
    ctx.lineTo(cx + cWidth, cy + (2 * cHeight) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner handles
    const handles = getHandles(cx, cy, cWidth, cHeight);
    handles.forEach((h) => {
      ctx.fillStyle = "#ff6b35";
      ctx.shadowColor = "rgba(255,107,53,0.5)";
      ctx.shadowBlur = 6;
      ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.shadowBlur = 0;
    });

    // Corner radius indicator label
    ctx.fillStyle = "rgba(255,107,53,0.85)";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.round(cWidth)}×${Math.round(cHeight)}`,
      cx + cWidth / 2,
      cy - 8
    );
  }, [crop, imgLoaded]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getHandles = (cx: number, cy: number, cw: number, ch: number) => [
    { name: "tl", x: cx, y: cy },
    { name: "tr", x: cx + cw, y: cy },
    { name: "bl", x: cx, y: cy + ch },
    { name: "br", x: cx + cw, y: cy + ch },
    { name: "tm", x: cx + cw / 2, y: cy },
    { name: "bm", x: cx + cw / 2, y: cy + ch },
    { name: "ml", x: cx, y: cy + ch / 2 },
    { name: "mr", x: cx + cw, y: cy + ch / 2 },
  ];

  const getRelativePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const hitHandle = (nx: number, ny: number): string | null => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = crop.x * rect.width;
    const cy = crop.y * rect.height;
    const cw = crop.width * rect.width;
    const ch = crop.height * rect.height;
    const handles = getHandles(cx, cy, cw, ch);
    const hitRadius = (HANDLE_SIZE + 6) / rect.width;
    for (const h of handles) {
      const hx = h.x / rect.width;
      const hy = h.y / rect.height;
      if (Math.abs(nx - hx) < hitRadius && Math.abs(ny - hy) < hitRadius) {
        return h.name;
      }
    }
    return null;
  };

  const insideCrop = (nx: number, ny: number) => {
    return (
      nx >= crop.x &&
      nx <= crop.x + crop.width &&
      ny >= crop.y &&
      ny <= crop.y + crop.height
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getRelativePos(e);
    const handle = hitHandle(x, y);
    if (handle) {
      setIsResizing(handle);
      setDragStartCrop({ ...crop });
      setDragStart({ x, y });
    } else if (insideCrop(x, y)) {
      setIsDragging(true);
      setDragStart({ x, y });
      setDragStartCrop({ ...crop });
    } else {
      // Start new crop
      setCrop({ x, y, width: 0.001, height: 0.001 });
      setIsResizing("br");
      setDragStart({ x, y });
      setDragStartCrop({ x, y, width: 0, height: 0 });
    }
  };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const { x, y } = getRelativePos(e);

    if (!dragStart || (!isDragging && !isResizing)) {
      // Update cursor
      const handle = hitHandle(x, y);
      if (handle) {
        const cursorMap: Record<string, string> = {
          tl: "nwse-resize", tr: "nesw-resize",
          bl: "nesw-resize", br: "nwse-resize",
          tm: "ns-resize", bm: "ns-resize",
          ml: "ew-resize", mr: "ew-resize",
        };
        canvas.style.cursor = cursorMap[handle] || "default";
      } else if (insideCrop(x, y)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "crosshair";
      }
      return;
    }

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (isDragging && dragStartCrop) {
      setCrop((prev) => ({
        ...prev,
        x: clamp(dragStartCrop.x + dx, 0, 1 - dragStartCrop.width),
        y: clamp(dragStartCrop.y + dy, 0, 1 - dragStartCrop.height),
      }));
    } else if (isResizing && dragStartCrop) {
      let { x: nx, y: ny, width: nw, height: nh } = dragStartCrop;

      switch (isResizing) {
        case "br": nw = clamp(dragStartCrop.width + dx, 0.05, 1 - nx); nh = clamp(dragStartCrop.height + dy, 0.05, 1 - ny); break;
        case "bl": { const newX = clamp(dragStartCrop.x + dx, 0, dragStartCrop.x + dragStartCrop.width - 0.05); nx = newX; nw = dragStartCrop.x + dragStartCrop.width - newX; nh = clamp(dragStartCrop.height + dy, 0.05, 1 - ny); break; }
        case "tr": { const newY = clamp(dragStartCrop.y + dy, 0, dragStartCrop.y + dragStartCrop.height - 0.05); ny = newY; nh = dragStartCrop.y + dragStartCrop.height - newY; nw = clamp(dragStartCrop.width + dx, 0.05, 1 - nx); break; }
        case "tl": { const newX2 = clamp(dragStartCrop.x + dx, 0, dragStartCrop.x + dragStartCrop.width - 0.05); const newY2 = clamp(dragStartCrop.y + dy, 0, dragStartCrop.y + dragStartCrop.height - 0.05); nx = newX2; ny = newY2; nw = dragStartCrop.x + dragStartCrop.width - newX2; nh = dragStartCrop.y + dragStartCrop.height - newY2; break; }
        case "tm": { const newY3 = clamp(dragStartCrop.y + dy, 0, dragStartCrop.y + dragStartCrop.height - 0.05); ny = newY3; nh = dragStartCrop.y + dragStartCrop.height - newY3; break; }
        case "bm": nh = clamp(dragStartCrop.height + dy, 0.05, 1 - ny); break;
        case "ml": { const newX3 = clamp(dragStartCrop.x + dx, 0, dragStartCrop.x + dragStartCrop.width - 0.05); nx = newX3; nw = dragStartCrop.x + dragStartCrop.width - newX3; break; }
        case "mr": nw = clamp(dragStartCrop.width + dx, 0.05, 1 - nx); break;
      }

      if (aspectRatio && nw > 0) {
        nh = nw / aspectRatio;
        if (ny + nh > 1) { nh = 1 - ny; nw = nh * aspectRatio; }
      }

      setCrop({ x: nx, y: ny, width: nw, height: nh });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
    setDragStart(null);
    setDragStartCrop(null);
  };

  const resetCrop = () => {
    setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  };

  const applyCrop = async () => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;
    setIsCropping(true);

    try {
      const offscreen = document.createElement("canvas");
      const srcX = Math.round(crop.x * img.naturalWidth);
      const srcY = Math.round(crop.y * img.naturalHeight);
      const srcW = Math.round(crop.width * img.naturalWidth);
      const srcH = Math.round(crop.height * img.naturalHeight);

      offscreen.width = srcW;
      offscreen.height = srcH;
      const ctx = offscreen.getContext("2d")!;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

      offscreen.toBlob(
        (blob) => {
          if (!blob) return;
          const dataUrl = offscreen.toDataURL("image/jpeg", 0.92);
          onCropComplete(blob, dataUrl);
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setIsCropping(false);
    }
  };

  // Load image into ref
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    setImgLoaded(true);
  };

  const canvasSize = 560;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0d0d12] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
              <Crop className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-white text-sm">کراپ تصویر کاور</h3>
              <p className="text-zinc-500 text-[10px]">ناحیه مورد نظر را انتخاب کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center gap-4 p-6 overflow-y-auto">
          {/* Hidden source image for natural dimensions */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="source"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={handleImgLoad}
          />

          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-black select-none"
            style={{ width: canvasSize, maxWidth: "100%" }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={Math.round(canvasSize * 0.72)}
              style={{ width: "100%", display: "block", cursor: "crosshair" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>
              ناحیه انتخابی:{" "}
              <span className="text-brand-orange font-semibold">
                {Math.round(crop.width * 100)}% × {Math.round(crop.height * 100)}%
              </span>
            </span>
            <span className="text-zinc-700">|</span>
            <span>کشیدن = جابجایی · گوشه‌ها = تغییر اندازه</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800 bg-[#0a0a0f]/60">
          <button
            onClick={resetCrop}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازنشانی
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={applyCrop}
              disabled={!imgLoaded || isCropping}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-xs hover:scale-[1.02] hover:shadow-[0_0_20px_-3px_rgba(255,107,53,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              {isCropping ? "در حال پردازش..." : "اعمال کراپ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
