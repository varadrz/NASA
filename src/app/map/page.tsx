// Campus Map and Convention Schedule Page
// Location: src/app/map/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Compass, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Play, 
  Eye,
  EyeOff
} from 'lucide-react';

interface EventItem {
  time: string;
  startHour: number; // 24h decimal format (e.g. 9.5 for 09:30 AM, 14.5 for 02:30 PM)
  endHour: number;
  speaker: string;
  topic: string;
  venue: string;
  type: 'Masterclass' | 'Seminar' | 'Workshop' | 'Nexus Event';
}

interface ScheduleDay {
  dayName: string;
  dateStr: string; // "YYYY-MM-DD"
  events: EventItem[];
}

const SCHEDULE_DATA: ScheduleDay[] = [
  {
    dayName: "DAY 01",
    dateStr: "2026-06-11",
    events: [
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Shri Ram R M", topic: "Madras Terrace Roofing Construction", venue: "OUTDOOR SHED", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Rajesh Kumar V.", topic: "Think Parametric: Algorithmic Architecture", venue: "Design Block D-103", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Zee Ehtram", topic: "Installation Art & Spatial Sculpting", venue: "Lab Block F-102", type: "Workshop" },
      { time: "10:00 AM – 11:00 AM", startHour: 10.0, endHour: 11.0, speaker: "Ar. Rohan Shivkumar", topic: "Space in Cinema & Architectural Narratives", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "10:00 AM – 04:00 PM", startHour: 10.0, endHour: 16.0, speaker: "NASA India Council", topic: "Heritage Treasure Hunt Quest", venue: "Library Lawn", type: "Nexus Event" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Himanshu Patel", topic: "Designing with Vernacular Wisdom & Climate Response", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Kamal Kamaraju", topic: "The Directed Space: Translating Film to Blueprints", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "11:30 AM – 12:30 PM", startHour: 11.5, endHour: 12.5, speaker: "Ar. Shabbir Unwala", topic: "Design with Nature & Ecological Adaptations", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "11:30 AM – 12:30 PM", startHour: 11.5, endHour: 12.5, speaker: "Ar. Vishwanath Kashikar", topic: "Why do most Design Studios fail to meet objectives?", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Sona Reddy", topic: "Experiential Dining: Architecture Beyond Food", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "03:30 PM – 04:30 PM", startHour: 15.5, endHour: 16.5, speaker: "Dr. Rajan Rawal", topic: "Role of First Principles of Sciences in Built Environment", venue: "LT (Lecture Theatre)", type: "Masterclass" }
    ]
  },
  {
    dayName: "DAY 02",
    dateStr: "2026-06-12",
    events: [
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Sandeep Raju", topic: "Rammed Earth & Sustainable Wall Assemblies", venue: "Lab Block F-002", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Aditya Sharma", topic: "Mud Construction & Natural Building Workshop", venue: "Design Block D-101", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Dirty Hands", topic: "Cob Wall Design & Structural Plasters", venue: "OUTDOOR FIELD", type: "Workshop" },
      { time: "10:00 AM – 11:00 AM", startHour: 10.0, endHour: 11.0, speaker: "Dhwaj Shah", topic: "Advanced Parametric Facades & Visualizations", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "10:00 AM – 12:00 PM", startHour: 10.0, endHour: 12.0, speaker: "NASA India", topic: "Design Disaster: Rapid Prototyping Clash", venue: "Admin Lawn", type: "Nexus Event" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Apurva Bose Dutta", topic: "The Practical Palette: Evolving Architectural Writing", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Talulah D'Silva", topic: "Designing Habitats: Where Built Form Supports Life", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "12:30 PM – 01:30 PM", startHour: 12.5, endHour: 13.5, speaker: "Kalaiselvi", topic: "Invisible Architecture: Designing Through Sound", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "12:30 PM – 01:30 PM", startHour: 12.5, endHour: 13.5, speaker: "Paul Kronenberg", topic: "Catalysts by Design: The Changineer Way", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Ayan Sen", topic: "Making Architecture Contextual & Climatic Adaptation", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Anuj Daga", topic: "How Writing Shapes the Image of Architecture?", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "03:30 PM – 04:30 PM", startHour: 15.5, endHour: 16.5, speaker: "Ar. Gaurav Shorey", topic: "What Lies behind Sustainable Buildings?", venue: "LT (Lecture Theatre)", type: "Masterclass" }
    ]
  },
  {
    dayName: "DAY 03",
    dateStr: "2026-06-13",
    events: [
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Lakshya Satija", topic: "Spanning Space: Exploration of Large Span Structures", venue: "Lab Block F-002", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Shweta Hingane", topic: "Architectural Photoshop & Render Compositing", venue: "Lenovo Lab D-105", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Pingali Naga Praveen", topic: "Syntactic Structures: From Words to Space Making", venue: "Law Block E-302", type: "Workshop" },
      { time: "10:00 AM – 11:00 AM", startHour: 10.0, endHour: 11.0, speaker: "Dr. Jigna Desai", topic: "Why Conserve? And Other Dilemmas of Architecture", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Reboni Saha", topic: "Integrated Design Thinking: Architecture & Product", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Prashant Pole", topic: "Architecture: Form, Function and Context - A Narrative", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "11:30 AM – 12:30 PM", startHour: 11.5, endHour: 12.5, speaker: "Ar. Sujata Hingorani", topic: "Landscape design and urban ecosystem planning", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "12:30 PM – 01:30 PM", startHour: 12.5, endHour: 13.5, speaker: "Eliza Higgins", topic: "Design and Spatial Inclusivity in modern developments", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Ankush Chandran", topic: "Urban Practice in the Age of Data", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Shikha Jain", topic: "Heritage conservation guidelines and frameworks", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "03:30 PM – 04:30 PM", startHour: 15.5, endHour: 16.5, speaker: "Ar. Aditi Pai", topic: "Green certifications and ratings for buildings", venue: "LT (Lecture Theatre)", type: "Masterclass" }
    ]
  },
  {
    dayName: "DAY 04",
    dateStr: "2026-06-14",
    events: [
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Sagar Saoji", topic: "Content Creation in Architecture & Portfolio Design", venue: "Law Block E-104", type: "Workshop" },
      { time: "09:30 AM – 04:30 PM", startHour: 9.5, endHour: 16.5, speaker: "Ar. Charlie & Ar. Ridhu", topic: "UDL After Effects & Motion Design Masterclass", venue: "Lab Block F-102", type: "Workshop" },
      { time: "10:00 AM – 11:00 AM", startHour: 10.0, endHour: 11.0, speaker: "Prof. Surya Kakani", topic: "Structuring Thought & Spatial Tectonics", venue: "LT (Lecture Theatre)", type: "Masterclass" },
      { time: "10:00 AM – 12:00 PM", startHour: 10.0, endHour: 12.0, speaker: "NASA India Council", topic: "ScrapScape Challenge & Sculpting Showcase", venue: "Admin Lawn", type: "Nexus Event" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Pankaj Sekhsaria", topic: "Great Nicobar - An Island on the brink", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "10:30 AM – 12:00 PM", startHour: 10.5, endHour: 12.0, speaker: "Nripal Adhikary", topic: "Revisiting Vernacular in the 21st Century", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "12:30 PM – 01:30 PM", startHour: 12.5, endHour: 13.5, speaker: "Krithika Karuppiah", topic: "Vastu vs Modern Design: Science or Superstition?", venue: "Seminar Room E-012", type: "Seminar" },
      { time: "12:30 PM – 01:30 PM", startHour: 12.5, endHour: 13.5, speaker: "Sapna Desai", topic: "Intersection of Public Health & Architecture", venue: "Seminar Room E-015", type: "Seminar" },
      { time: "02:30 PM – 04:00 PM", startHour: 14.5, endHour: 16.0, speaker: "Sreenag", topic: "Rethinking Architectural Photography & Angles", venue: "Seminar Room E-012", type: "Seminar" }
    ]
  }
];

export default function CampusMapPage() {
  // Map Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map Interactive Venue Selection
  const [activeVenue, setActiveVenue] = useState<string | null>(null);
  const [filterVenue, setFilterVenue] = useState<string | null>(null);

  // Schedule Filters & Toggles
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [showPastEvents, setShowPastEvents] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Clock state (updates every second)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [blinkColon, setBlinkColon] = useState(true);

  // Sync Live Clock & Blinking Colons
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setBlinkColon(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Zoom Handlers
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetMap = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setActiveVenue(null);
    setFilterVenue(null);
  };

  // Map venue names to map block IDs
  const mapVenueToBlockId = (venue: string): string => {
    const v = venue.toUpperCase();
    if (v.includes('OUTDOOR SHED')) return 'outdoor-shed';
    if (v.includes('OUTDOOR FIELD')) return 'outdoor-field';
    if (v.includes('D-103') || v.includes('D-101') || v.includes('D-105') || v.includes('DESIGN BLOCK')) return 'block-d';
    if (v.includes('F-102') || v.includes('F-002') || v.includes('LAB BLOCK')) return 'block-f';
    if (v.includes('LECTURE THEATRE') || v.includes('LT')) return 'admin-lt';
    if (v.includes('LIBRARY LAWN') || v.includes('LIBRARY')) return 'library';
    if (v.includes('E-012') || v.includes('E-015') || v.includes('E-302') || v.includes('E-104') || v.includes('LAW BLOCK') || v.includes('SEMINAR ROOM')) return 'block-e';
    if (v.includes('ADMIN LAWN')) return 'admin-lawn';
    return '';
  };

  const VENUE_COORDS: { [key: string]: { x: number; y: number } } = {
    'block-d': { x: 320, y: 180 },
    'block-f': { x: 540, y: 140 },
    'block-e': { x: 720, y: 240 },
    'library': { x: 520, y: 340 },
    'admin-lt': { x: 280, y: 420 },
    'outdoor-shed': { x: 830, y: 330 },
    'outdoor-field': { x: 840, y: 460 },
    'admin-lawn': { x: 370, y: 470 }
  };

  const handleLocateVenue = (venueName: string) => {
    const venueId = mapVenueToBlockId(venueName);
    if (!venueId) return;

    const coords = VENUE_COORDS[venueId];
    if (coords) {
      setActiveVenue(venueId);
      setFilterVenue(venueId); // Also filter by this venue
      setScale(1.4);
      setPosition({
        x: 500 - coords.x * 1.4,
        y: 250 - coords.y * 1.4
      });

      // Smooth scroll to map container
      const mapElem = document.getElementById('campus-map-section');
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleBlockClick = (blockId: string) => {
    if (filterVenue === blockId) {
      setFilterVenue(null);
      setActiveVenue(null);
    } else {
      setFilterVenue(blockId);
      setActiveVenue(blockId);
    }
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

  // Helper to format live clock string with blinking colons
  const formatLiveClock = () => {
    if (!currentTime) return "-- : -- : -- --";
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    const separator = blinkColon ? ":" : " ";
    
    return `${pad(displayHours)}${separator}${pad(minutes)}${separator}${pad(seconds)} ${ampm}`;
  };

  // Calculate hour decimal representation for comparing with event slots (simulating convention time using current clock)
  const getSimulatedHourDecimal = () => {
    if (!currentTime) return 10.0; // Default to 10 AM
    return currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
  };

  // Check event status
  const getEventStatus = (event: EventItem, dayIdx: number) => {
    // If selected day tab represents a day before our active day simulation, all are completed.
    // In our case, let's treat the active simulation day as index 0 (Day 1).
    const activeSimulatedDayIdx = 0;

    if (dayIdx < activeSimulatedDayIdx) {
      return 'COMPLETED';
    } else if (dayIdx > activeSimulatedDayIdx) {
      return 'UPCOMING';
    }

    // Comparing for current active simulated day (Day 1)
    const currentHour = getSimulatedHourDecimal();
    if (currentHour > event.endHour) {
      return 'COMPLETED';
    } else if (currentHour >= event.startHour && currentHour <= event.endHour) {
      return 'LIVE';
    } else {
      return 'UPCOMING';
    }
  };

  // Filter events based on active tab, type filter, and showPastEvents toggle
  const currentDayData = SCHEDULE_DATA[selectedDayIdx];
  const filteredEvents = currentDayData.events.filter(event => {
    // 1. Filter by event type
    if (selectedType !== 'ALL' && event.type.toUpperCase() !== selectedType) {
      return false;
    }

    // 2. Filter by past events toggle
    const status = getEventStatus(event, selectedDayIdx);
    if (!showPastEvents && status === 'COMPLETED') {
      return false;
    }

    // 3. Filter by selected map venue
    if (filterVenue) {
      const blockId = mapVenueToBlockId(event.venue);
      if (blockId !== filterVenue) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-12 flex flex-col pb-24">
        {/* Title Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-brand-on-surface pb-6 shrink-0">
          <div>
            <span className="font-mono text-[10px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              SITE PLAN
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface flex items-center gap-2 tracking-tight">
              <Compass className="h-8 w-8 text-brand-secondary animate-spin-slow" />
              Timeline and Campus Map
            </h1>
            <p className="text-brand-on-surface-variant text-sm mt-2 font-sans font-medium">
              High-resolution spatial guide of campus sectors, academic blocks, and checkpoints.
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
        <div id="campus-map-section" className="w-full h-[500px] border-4 border-brand-on-surface bg-brand-surface-highest shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] relative overflow-hidden flex items-center justify-center select-none">
          {/* Active Filter Overlay Banner */}
          {filterVenue && (
            <div className="absolute bottom-4 left-4 bg-brand-mustard text-brand-on-surface border-4 border-brand-on-surface px-4 py-2.5 flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] z-30 animate-slide-up">
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                FILTERED BY: {filterVenue.replace('-', ' ')}
              </span>
              <button 
                onClick={() => {
                  setFilterVenue(null);
                  setActiveVenue(null);
                }}
                className="bg-brand-surface text-brand-on-surface border-2 border-brand-on-surface px-2.5 py-1 font-mono text-[9px] font-black uppercase hover:bg-brand-surface-low cursor-pointer transition-all active:translate-y-[1px]"
              >
                Clear Filter
              </button>
            </div>
          )}

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
            onTouchEnd={handleMouseUp}
            className="w-full h-full absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <svg
              viewBox="0 0 1000 600"
              className="w-[1000px] h-[600px] shrink-0 pointer-events-auto select-none"
              style={{ minWidth: '1000px', minHeight: '600px' }}
            >
              {/* Gradients Defs */}
              <defs>
                <linearGradient id="roof-mustard" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd43b" />
                  <stop offset="100%" stopColor="#fab005" />
                </linearGradient>
                <linearGradient id="wall-mustard-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fab005" />
                  <stop offset="100%" stopColor="#f59f00" />
                </linearGradient>
                <linearGradient id="wall-mustard-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59f00" />
                  <stop offset="100%" stopColor="#e67700" />
                </linearGradient>

                <linearGradient id="roof-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22b8cf" />
                  <stop offset="100%" stopColor="#15aabf" />
                </linearGradient>
                <linearGradient id="wall-cyan-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#15aabf" />
                  <stop offset="100%" stopColor="#0c8599" />
                </linearGradient>
                <linearGradient id="wall-cyan-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0c8599" />
                  <stop offset="100%" stopColor="#0b7285" />
                </linearGradient>

                <linearGradient id="roof-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8787" />
                  <stop offset="100%" stopColor="#fa5252" />
                </linearGradient>
                <linearGradient id="wall-primary-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fa5252" />
                  <stop offset="100%" stopColor="#e03131" />
                </linearGradient>
                <linearGradient id="wall-primary-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e03131" />
                  <stop offset="100%" stopColor="#c92a2a" />
                </linearGradient>

                <linearGradient id="roof-sand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f3f5" />
                </linearGradient>
                <linearGradient id="wall-sand-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e9ecef" />
                  <stop offset="100%" stopColor="#dee2e6" />
                </linearGradient>
                <linearGradient id="wall-sand-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dee2e6" />
                  <stop offset="100%" stopColor="#ced4da" />
                </linearGradient>

                <linearGradient id="roof-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5dbff" />
                  <stop offset="100%" stopColor="#cc5de8" />
                </linearGradient>
                <linearGradient id="wall-purple-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#be4bdb" />
                  <stop offset="100%" stopColor="#ae3ec9" />
                </linearGradient>
                <linearGradient id="wall-purple-r" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ae3ec9" />
                  <stop offset="100%" stopColor="#862e9c" />
                </linearGradient>
              </defs>

              {/* Grid Background Pattern */}
              <rect width="100%" height="100%" fill="#f4f0ea" />
              <path d="M 0,0 L 1000,600 M 0,100 L 800,600 M 0,200 L 600,600 M 0,300 L 400,600 M 0,400 L 200,600 M 200,0 L 1000,480 M 400,0 L 1000,360 M 600,0 L 1000,240 M 800,0 L 1000,120" stroke="#eae5db" strokeWidth="1.5" />
              <path d="M 0,600 L 1000,0 M 0,500 L 833,0 M 0,400 L 666,0 M 0,300 L 500,0 M 0,200 L 333,0 M 0,100 L 166,0 M 166,600 L 1000,100 M 333,600 L 1000,200 M 500,600 L 1000,300 M 666,600 L 1000,400 M 833,600 L 1000,500" stroke="#eae5db" strokeWidth="1.5" />

              {/* Walkway Paths */}
              <path d="M 280,440 L 320,180 L 540,140 L 720,240 L 830,330 L 840,460 L 520,340 Z" fill="none" stroke="#e3ded4" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 280,440 L 320,180 L 540,140 L 720,240 L 830,330 L 840,460 L 520,340 Z" fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />

              {/* Grass Lawns */}
              <polygon 
                points="430,375 490,340 550,375 490,410" 
                fill="#d8f5a2" 
                stroke="#a7db58" 
                strokeWidth="2.5" 
                className="cursor-pointer hover:fill-[#c0eb75] transition-all"
                onClick={() => handleBlockClick('library')}
              />
              <polygon 
                points="330,470 375,445 420,470 375,495" 
                fill="#d8f5a2" 
                stroke="#a7db58" 
                strokeWidth="2.5" 
                className="cursor-pointer hover:fill-[#c0eb75] transition-all"
                onClick={() => handleBlockClick('admin-lawn')}
              />
              <polygon 
                points="740,465 840,415 940,465 840,515" 
                fill="#c3fae8" 
                stroke="#63e6be" 
                strokeWidth="2.5" 
                className="cursor-pointer hover:fill-[#96f2d7] transition-all"
                onClick={() => handleBlockClick('outdoor-field')}
              />

              {/* ---------------- 3D ISOMETRIC BUILDINGS ---------------- */}

              {/* 1. Classroom Block D */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('block-d')}
              >
                {/* Left Wall */}
                <polygon 
                  points="240,180 240,240 320,280 320,220" 
                  fill="url(#wall-mustard-l)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-d' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Right Wall */}
                <polygon 
                  points="320,220 320,280 400,240 400,180" 
                  fill="url(#wall-mustard-r)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-d' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Top Roof */}
                <polygon 
                  points="240,180 320,140 400,180 320,220" 
                  fill="url(#roof-mustard)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-d' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />
                
                {/* Windows */}
                <line x1="260" y1="200" x2="260" y2="230" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="280" y1="210" x2="280" y2="240" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="300" y1="220" x2="300" y2="250" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="340" y1="220" x2="340" y2="250" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="360" y1="210" x2="360" y2="240" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="380" y1="200" x2="380" y2="230" stroke="#1c1b1b" strokeWidth="2.5" strokeDasharray="3 3" />

                {/* Tag */}
                <g transform="translate(320, 120)">
                  <rect x="-60" y="-12" width="120" height="24" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" className="font-display font-black text-[9px] uppercase tracking-widest text-center" textAnchor="middle">
                    DESIGN BLOCK D
                  </text>
                </g>
              </g>

              {/* 2. Lab Block F */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('block-f')}
              >
                {/* Left Wall */}
                <polygon 
                  points="480,140 480,190 540,220 540,170" 
                  fill="url(#wall-cyan-l)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-f' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Right Wall */}
                <polygon 
                  points="540,170 540,220 600,190 600,140" 
                  fill="url(#wall-cyan-r)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-f' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Top Roof */}
                <polygon 
                  points="480,140 540,110 600,140 540,170" 
                  fill="url(#roof-cyan)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-f' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />

                <line x1="510" y1="135" x2="570" y2="165" stroke="#1c1b1b" strokeWidth="1" opacity="0.4" />
                <line x1="500" y1="145" x2="560" y2="175" stroke="#1c1b1b" strokeWidth="1" opacity="0.4" />

                {/* Tag */}
                <g transform="translate(540, 90)">
                  <rect x="-50" y="-12" width="100" height="24" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" className="font-display font-black text-[9px] uppercase tracking-widest text-center" textAnchor="middle">
                    LAB BLOCK F
                  </text>
                </g>
              </g>

              {/* 3. Academic Block E */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('block-e')}
              >
                {/* Left Wall */}
                <polygon 
                  points="650,240 650,300 720,340 720,280" 
                  fill="url(#wall-purple-l)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-e' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Right Wall */}
                <polygon 
                  points="720,280 720,340 790,300 790,240" 
                  fill="url(#wall-purple-r)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-e' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Top Roof */}
                <polygon 
                  points="650,240 720,200 790,240 720,280" 
                  fill="url(#roof-purple)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'block-e' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />

                <line x1="670" y1="265" x2="670" y2="285" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="690" y1="275" x2="690" y2="295" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="750" y1="275" x2="750" y2="295" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="770" y1="265" x2="770" y2="285" stroke="#1c1b1b" strokeWidth="2" />

                {/* Tag */}
                <g transform="translate(720, 180)">
                  <rect x="-60" y="-12" width="120" height="24" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" className="font-display font-black text-[9px] uppercase tracking-widest text-center" textAnchor="middle">
                    ACADEMIC BLOCK E
                  </text>
                </g>
              </g>

              {/* 4. Central Library */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('library')}
              >
                {/* Left Wall */}
                <polygon 
                  points="450,340 450,400 520,440 520,380" 
                  fill="url(#wall-sand-l)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'library' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Right Wall */}
                <polygon 
                  points="520,380 520,440 590,400 590,340" 
                  fill="url(#wall-sand-r)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'library' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Top Roof */}
                <polygon 
                  points="450,340 520,300 590,340 520,380" 
                  fill="url(#roof-sand)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'library' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />

                <line x1="475" y1="365" x2="475" y2="395" stroke="#1c1b1b" strokeWidth="1.5" opacity="0.6" />
                <line x1="495" y1="375" x2="495" y2="405" stroke="#1c1b1b" strokeWidth="1.5" opacity="0.6" />
                <line x1="545" y1="375" x2="545" y2="405" stroke="#1c1b1b" strokeWidth="1.5" opacity="0.6" />
                <line x1="565" y1="365" x2="565" y2="395" stroke="#1c1b1b" strokeWidth="1.5" opacity="0.6" />

                {/* Tag */}
                <g transform="translate(520, 280)">
                  <rect x="-60" y="-12" width="120" height="24" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" className="font-display font-black text-[9px] uppercase tracking-widest text-center" textAnchor="middle">
                    CENTRAL LIBRARY & LAWN
                  </text>
                </g>
              </g>

              {/* 5. Admin Block & LT */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('admin-lt')}
              >
                {/* Left Wall */}
                <polygon 
                  points="200,420 200,490 280,530 280,460" 
                  fill="url(#wall-primary-l)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'admin-lt' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Right Wall */}
                <polygon 
                  points="280,460 280,530 360,490 360,420" 
                  fill="url(#wall-primary-r)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'admin-lt' ? 'animate-active-venue' : 'group-hover:fill-opacity-90'}
                />
                {/* Top Roof */}
                <polygon 
                  points="200,420 280,370 360,420 280,460" 
                  fill="url(#roof-primary)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'admin-lt' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />

                <polygon points="240,410 280,385 320,410 280,430" fill="#c92a2a" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="240" y1="410" x2="240" y2="430" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="320" y1="410" x2="320" y2="430" stroke="#1c1b1b" strokeWidth="2" />
                <line x1="280" y1="430" x2="280" y2="450" stroke="#1c1b1b" strokeWidth="2" />

                {/* Tag */}
                <g transform="translate(280, 350)">
                  <rect x="-65" y="-12" width="130" height="24" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" className="font-display font-black text-[8.5px] uppercase tracking-widest text-center" textAnchor="middle">
                    ADMIN & LECTURE THEATRE
                  </text>
                </g>
              </g>

              {/* 6. Outdoor Shed */}
              <g 
                className="cursor-pointer group animate-slide-up"
                onClick={() => handleBlockClick('outdoor-shed')}
              >
                <line x1="790" y1="330" x2="790" y2="365" stroke="#1c1b1b" strokeWidth="3" />
                <line x1="830" y1="360" x2="830" y2="395" stroke="#1c1b1b" strokeWidth="3" />
                <line x1="870" y1="330" x2="870" y2="365" stroke="#1c1b1b" strokeWidth="3" />
                
                <polygon 
                  points="790,330 830,300 870,330 830,360" 
                  fill="url(#roof-sand)" 
                  stroke="#1c1b1b" 
                  strokeWidth="3.5" 
                  className={activeVenue === 'outdoor-shed' ? 'animate-active-venue' : 'group-hover:brightness-105'}
                />

                <g transform="translate(830, 280)">
                  <rect x="-45" y="-10" width="90" height="20" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="3" fill="#ffffff" className="font-display font-black text-[8px] uppercase tracking-widest text-center" textAnchor="middle">
                    OUTDOOR SHED
                  </text>
                </g>
              </g>

              {/* 7. Outdoor Field Label */}
              <g 
                className="cursor-pointer"
                onClick={() => handleBlockClick('outdoor-field')}
              >
                <g transform="translate(840, 450)">
                  <rect x="-45" y="-10" width="90" height="20" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="3" fill="#ffffff" className="font-display font-black text-[8px] uppercase tracking-widest text-center" textAnchor="middle">
                    OUTDOOR FIELD
                  </text>
                </g>
              </g>

              {/* 8. Admin Lawn Label */}
              <g 
                className="cursor-pointer"
                onClick={() => handleBlockClick('admin-lawn')}
              >
                <g transform="translate(375, 460)">
                  <rect x="-45" y="-10" width="90" height="20" fill="#1c1b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="3" fill="#ffffff" className="font-display font-black text-[8px] uppercase tracking-widest text-center" textAnchor="middle">
                    ADMIN LAWN
                  </text>
                </g>
              </g>

              {/* Bouncing Pin and Pulse Ring for Located/Active venue */}
              {activeVenue && VENUE_COORDS[activeVenue] && (
                <g transform={`translate(${VENUE_COORDS[activeVenue].x}, ${VENUE_COORDS[activeVenue].y - 30})`} className="pointer-events-none">
                  {/* Sonar Ring */}
                  <circle cx="0" cy="30" r="30" className="fill-none stroke-brand-primary stroke-2 animate-ping" />
                  
                  {/* Bouncing Pin */}
                  <g className="animate-bounce">
                    <path 
                      d="M -12 -12 C -12 -24, 12 -24, 12 -12 C 12 0, 0 12, 0 12 C 0 12, -12 0, -12 -12 Z" 
                      fill="#e03131" 
                      stroke="#1c1b1b" 
                      strokeWidth="3.5" 
                    />
                    <circle cx="0" cy="-12" r="5" fill="#ffffff" stroke="#1c1b1b" strokeWidth="2" />
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-brand-surface-low border-2 border-brand-on-surface text-[10px] text-brand-on-surface-variant text-center font-mono font-bold uppercase tracking-wider leading-relaxed">
          Active target checkpoint barrels are physically deployed near the marked spots. Cross-reference locations with the convention schedule below.
        </div>

        {/* ----------------- CONVENTION SCHEDULE SECTION ----------------- */}
        <div className="border-4 border-brand-on-surface bg-brand-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] flex flex-col">
          
          {/* Schedule Header and Logos */}
          <div className="p-6 md:p-8 bg-brand-surface border-b-4 border-brand-on-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] font-bold bg-brand-secondary text-brand-on-secondary px-3 py-1 uppercase tracking-wider">
                CONVENTION PROGRAM
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-brand-on-surface tracking-tight">
                68th Annual NASA Convention Schedule
              </h2>
              <p className="font-sans text-brand-on-surface-variant text-xs md:text-sm font-semibold uppercase">
                Hosted by Woxsen University • Powered by Catalyse • Organized by NASA India
              </p>
            </div>

            {/* Hosting Logos Branding */}
            <div className="flex items-center gap-4 bg-brand-surface-low border-2 border-brand-on-surface p-3 shrink-0">
              <div className="flex flex-col items-center">
                <span className="font-mono text-[8px] text-brand-on-surface-variant uppercase font-black mb-1.5">HOSTED BY</span>
                <img src="/woxsen-logo.png" alt="Woxsen Logo" className="h-7 object-contain" />
              </div>
              <div className="w-[2px] h-10 bg-brand-on-surface-variant opacity-30"></div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-[8px] text-brand-on-surface-variant uppercase font-black mb-1.5">POWERED BY</span>
                <img src="/catalyse-logo.png" alt="Catalyse Logo" className="h-7 object-contain" />
              </div>
              <div className="w-[2px] h-10 bg-brand-on-surface-variant opacity-30"></div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-[8px] text-brand-on-surface-variant uppercase font-black mb-1.5">ORGANIZED BY</span>
                <img src="/nasa-logo.png" alt="NASA Logo" className="h-7 object-contain" />
              </div>
            </div>
          </div>

          {/* LIVE DIGITAL TIMELINE / CLOCK BANNER (Blinking & Pulse) */}
          <div className="bg-brand-on-surface text-brand-surface p-4 border-b-4 border-brand-on-surface flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mustard opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-mustard"></span>
              </div>
              <span className="font-mono text-xs font-black tracking-widest text-brand-mustard uppercase">
                LIVE TIMELINE TUNER
              </span>
            </div>

            {/* Pulsing Blinking Digital Clock */}
            <div className="flex items-center gap-2 bg-brand-surface bg-opacity-10 border border-brand-surface border-opacity-35 px-4 py-2">
              <Clock className="h-4.5 w-4.5 text-brand-mustard animate-pulse" />
              <span className="font-mono text-sm md:text-base font-black tracking-wider text-brand-surface text-center">
                {currentDayData.dayName === "DAY 01" ? "11th JUNE 2026" : currentDayData.dateStr} | <span className="text-brand-mustard select-none">{formatLiveClock()}</span>
              </span>
            </div>

            <div className="font-mono text-[9px] uppercase font-bold text-brand-surface opacity-75">
              Updates in Real-Time
            </div>
          </div>

          {/* Day selection tabs */}
          <div className="flex overflow-x-auto border-b-4 border-brand-on-surface bg-brand-surface-highest md:grid md:grid-cols-4 scrollbar-none whitespace-nowrap">
            {SCHEDULE_DATA.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`py-4 px-6 text-center font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all border-r last:border-r-0 border-brand-on-surface cursor-pointer shrink-0 min-w-[130px] md:min-w-0 md:w-full ${
                  selectedDayIdx === idx 
                    ? 'bg-brand-primary text-brand-on-primary font-extrabold shadow-inner' 
                    : 'bg-brand-surface-highest text-brand-on-surface hover:bg-brand-surface-high'
                }`}
              >
                <div className="font-mono text-[9px] opacity-75 mb-1">DATE: {day.dateStr.split('-')[2]} JUNE</div>
                {day.dayName}
              </button>
            ))}
          </div>

          {/* Filters Controls block */}
          <div className="p-4 bg-brand-surface-low border-b-2 border-brand-on-surface flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            
             {/* Category selection */}
             <div className="flex overflow-x-auto gap-2 scrollbar-none whitespace-nowrap pb-1 md:pb-0">
               {[
                 { value: 'ALL', label: 'ALL' },
                 { value: 'MASTERCLASS', label: 'MASTERCLASSES' },
                 { value: 'SEMINAR', label: 'SEMINARS' },
                 { value: 'WORKSHOP', label: 'WORKSHOPS' },
                 { value: 'NEXUS EVENT', label: 'NEXUS EVENTS' }
               ].map((type) => (
                 <button
                   key={type.value}
                   onClick={() => setSelectedType(type.value)}
                   className={`px-3 py-1.5 border-2 border-brand-on-surface font-mono text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer shrink-0 ${
                     selectedType === type.value
                       ? 'bg-brand-secondary text-brand-on-secondary'
                       : 'bg-brand-surface text-brand-on-surface hover:bg-brand-surface-high'
                   }`}
                 >
                   {type.label}
                 </button>
               ))}
             </div>

            {/* Show/Hide Past Schedule Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowPastEvents(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-brand-on-surface font-mono text-[10px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] cursor-pointer ${
                  showPastEvents 
                    ? 'bg-brand-mustard text-brand-on-surface' 
                    : 'bg-brand-surface-highest text-brand-on-surface-variant'
                }`}
              >
                {showPastEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showPastEvents ? "Showing Past Schedule" : "Hiding Past Schedule"}
              </button>
            </div>
          </div>

          {/* Schedule Events List */}
          <div className="bg-brand-surface-low border-2 border-brand-on-surface min-h-[300px] overflow-hidden">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => {
                const status = getEventStatus(event, selectedDayIdx);
                const isLive = status === 'LIVE';

                return (
                  <div 
                    key={idx} 
                    className={`p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                      isLive 
                        ? 'bg-brand-mustard text-brand-on-surface border-4 border-brand-on-surface my-1.5 relative z-10 shadow-[3px_3px_0px_0px_rgba(28,27,27,1)]' 
                        : 'bg-brand-surface text-brand-on-surface border-b-4 border-brand-on-surface last:border-b-0'
                    }`}
                  >
                    
                    {/* Time & Status Column */}
                    <div className="md:w-1/4 space-y-3 shrink-0">
                      <div className="flex items-center gap-2 text-brand-on-surface">
                        <Clock className={`h-4.5 w-4.5 shrink-0 ${isLive ? 'text-brand-primary' : 'text-brand-secondary'}`} />
                        <span className="font-mono text-xs md:text-sm font-black tracking-tight">{event.time}</span>
                      </div>
                      
                      {/* Status Badges */}
                      <div>
                        {status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[9px] font-bold bg-brand-surface-highest text-brand-on-surface-variant border border-brand-on-surface border-opacity-50 uppercase shadow-[1.5px_1.5px_0px_0px_rgba(28,27,27,1)]">
                            <CheckCircle2 className="h-3 w-3 text-brand-secondary" />
                            COMPLETED EVENT
                          </span>
                        )}
                        {status === 'LIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[9px] font-bold bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface uppercase animate-pulse">
                            <Play className="h-3 w-3 fill-current text-brand-on-primary" />
                            LIVE NOW
                          </span>
                        )}
                        {status === 'UPCOMING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[9px] font-bold bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface uppercase shadow-[1.5px_1.5px_0px_0px_rgba(28,27,27,1)]">
                            <Clock className="h-3 w-3" />
                            UPCOMING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Column */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-brand-on-primary ${
                          event.type === 'Masterclass' ? 'bg-brand-primary' :
                          event.type === 'Seminar' ? 'bg-brand-secondary' :
                          event.type === 'Workshop' ? 'bg-brand-tertiary' : 'bg-brand-on-surface-variant'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <h3 className="font-display text-lg md:text-xl font-black uppercase text-brand-on-surface leading-tight">
                        {event.topic}
                      </h3>
                      {event.speaker && (
                        <div className="flex items-center gap-2 text-brand-on-surface-variant font-sans text-xs md:text-sm font-bold">
                          <Users className="h-4 w-4 opacity-75 shrink-0" />
                          <span>Speaker: {event.speaker}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Badge Column */}
                    <div className="md:w-1/4 shrink-0 flex flex-col md:items-end gap-2">
                      <div className="inline-flex items-center gap-1.5 bg-brand-surface-low border-2 border-brand-on-surface p-2 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] font-mono text-[10px] font-bold uppercase tracking-tight text-brand-on-surface">
                        <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                        {event.venue}
                      </div>
                      <button
                        onClick={() => handleLocateVenue(event.venue)}
                        className="px-3 py-1.5 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-[9px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer inline-flex items-center gap-1.5 w-fit"
                      >
                        <Compass className="h-3.5 w-3.5 text-brand-on-primary animate-spin-slow" />
                        Locate on Map
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-brand-surface">
                <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase">
                  No active events match the chosen filters.
                </span>
                {showPastEvents === false && (
                  <p className="text-[10px] font-mono text-brand-outline mt-2 uppercase">
                    Try checking "Showing Past Schedule" to see completed events for this day.
                  </p>
                )}
              </div>
            )}
          </div>
          
        </div>

      </main>
    </div>
  );
}
