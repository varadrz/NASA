// Campus Map Page
// Location: src/app/map/page.tsx

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Compass, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function CampusMapPage() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom Handlers
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetMap = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6 flex flex-col pb-24">
        {/* Title Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-brand-on-surface pb-6 shrink-0">
          <div>
            <span className="font-mono text-[10px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              SITE PLAN
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface flex items-center gap-2 tracking-tight">
              <Compass className="h-8 w-8 text-brand-secondary animate-spin-slow" />
              Woxsen Campus Map
            </h1>
            <p className="text-brand-on-surface-variant text-sm mt-2">
              High-resolution spatial guide of campus sectors, academic blocks, and recreational grounds.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="/campus-map.png"
              download="woxsen-campus-map.png"
              className="px-5 py-3 border-2 border-brand-on-surface bg-brand-secondary text-brand-on-secondary font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              Download Offline Map
            </a>
          </div>
        </div>

        {/* Zoom & Pan Viewport */}
        <div className="flex-1 min-h-[500px] border-4 border-brand-on-surface bg-brand-surface-highest shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] relative overflow-hidden flex items-center justify-center select-none">
          {/* Controls Bar Overlay */}
          <div className="absolute top-4 right-4 flex gap-2 z-30">
            <button 
              onClick={zoomIn}
              className="bg-brand-surface p-3 border-2 border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button 
              onClick={zoomOut}
              className="bg-brand-surface p-3 border-2 border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button 
              onClick={resetMap}
              className="bg-brand-surface p-3 border-2 border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Draggable Map Canvas */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full h-full absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <img
              alt="High Quality Woxsen Campus Map"
              src="/campus-map.png"
              className="max-w-[90%] max-h-[90%] object-contain pointer-events-none shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] border-2 border-brand-on-surface bg-white"
            />
          </div>
        </div>

        {/* Footer Info Banner */}
        <div className="p-4 bg-brand-surface-low border-2 border-brand-on-surface text-[10px] text-brand-on-surface-variant text-center font-mono font-bold uppercase tracking-wider leading-relaxed shrink-0">
          This map provides high-fidelity isometric layouts of active landmarks. Checkpoint barrels are physically deployed near the marked spots.
        </div>
      </main>
    </div>
  );
}
