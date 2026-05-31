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

const HOTSPOTS = [
  { id: 'academic-block', label: 'Academic Block', x: 560, y: 260 },
  { id: 'admin-block', label: 'Admin Block', x: 560, y: 450 },
  { id: 'trade-tower', label: 'Trade Tower', x: 670, y: 340 },
  { id: 'library', label: 'Central Library', x: 670, y: 180 },
  { id: 'the-league', label: 'The League (Shed/SportX)', x: 1240, y: 180 },
  { id: 'race-field', label: 'RACE / Field', x: 1110, y: 180 }
];

export default function CampusMapPage() {
  // Map Zoom & Pan State
  const [scale, setScale] = useState(0.7);
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
    setScale(0.7);
    setPosition({ x: 0, y: 0 });
    setActiveVenue(null);
    setFilterVenue(null);
  };

  // Map venue names to map block IDs
  const mapVenueToBlockId = (venue: string): string => {
    const v = venue.toUpperCase();
    if (v.includes('OUTDOOR SHED') || v.includes('THE LEAGUE') || v.includes('SPORTX')) return 'the-league';
    if (v.includes('OUTDOOR FIELD') || v.includes('RACE') || v.includes('CRICKET') || v.includes('FIELD')) return 'race-field';
    if (v.includes('D-103') || v.includes('D-101') || v.includes('D-105') || v.includes('DESIGN BLOCK') || v.includes('ACADEMIC BLOCK')) return 'academic-block';
    if (v.includes('F-102') || v.includes('F-002') || v.includes('LAB BLOCK') || v.includes('TRADE TOWER')) return 'trade-tower';
    if (v.includes('LECTURE THEATRE') || v.includes('LT') || v.includes('ADMIN BLOCK')) return 'admin-block';
    if (v.includes('LIBRARY LAWN') || v.includes('LIBRARY')) return 'library';
    if (v.includes('E-012') || v.includes('E-015') || v.includes('E-302') || v.includes('E-104') || v.includes('LAW BLOCK') || v.includes('SEMINAR ROOM')) return 'academic-block';
    if (v.includes('ADMIN LAWN')) return 'admin-block';
    return '';
  };

  const VENUE_COORDS: { [key: string]: { x: number; y: number } } = {
    'academic-block': { x: 560, y: 260 },
    'admin-block': { x: 560, y: 450 },
    'trade-tower': { x: 670, y: 340 },
    'library': { x: 670, y: 180 },
    'the-league': { x: 1240, y: 180 },
    'race-field': { x: 1110, y: 180 }
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
        x: 800 - coords.x * 1.4,
        y: 335 - coords.y * 1.4
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
            <div className="relative w-[1600px] h-[670px] shrink-0 pointer-events-auto select-none bg-[#F2EDE4] border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] overflow-hidden">
              {/* Vector SVG Campus Background & Landmark Graphics */}
              <svg
                viewBox="0 0 1600 670"
                className="w-full h-full absolute inset-0 pointer-events-none"
              >
                {/* Defs for Gradients */}
                <defs>
                  <pattern id="dot-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="#E2D9CD" />
                  </pattern>

                  {/* Academic Block Colors */}
                  <linearGradient id="academic-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd43b" />
                    <stop offset="100%" stopColor="#fab005" />
                  </linearGradient>
                  <linearGradient id="academic-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fab005" />
                    <stop offset="100%" stopColor="#f59f00" />
                  </linearGradient>

                  {/* Admin Block Colors */}
                  <linearGradient id="admin-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff8787" />
                    <stop offset="100%" stopColor="#fa5252" />
                  </linearGradient>
                  <linearGradient id="admin-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fa5252" />
                    <stop offset="100%" stopColor="#e03131" />
                  </linearGradient>

                  {/* Trade Tower Colors */}
                  <linearGradient id="trade-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22b8cf" />
                    <stop offset="100%" stopColor="#15aabf" />
                  </linearGradient>
                  <linearGradient id="trade-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#15aabf" />
                    <stop offset="100%" stopColor="#0c8599" />
                  </linearGradient>

                  {/* Library Colors */}
                  <linearGradient id="lib-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f3f5" />
                  </linearGradient>
                  <linearGradient id="lib-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e9ecef" />
                    <stop offset="100%" stopColor="#dee2e6" />
                  </linearGradient>

                  {/* Hostels Colors */}
                  <linearGradient id="hostel-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e5dbff" />
                    <stop offset="100%" stopColor="#cc5de8" />
                  </linearGradient>
                  <linearGradient id="hostel-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#be4bdb" />
                    <stop offset="100%" stopColor="#ae3ec9" />
                  </linearGradient>
                </defs>

                {/* Dot Grid Background */}
                <rect width="100%" height="100%" fill="url(#dot-grid)" />

                {/* Styled Grid Lines for Tech Aesthetic */}
                <path d="M 0,0 L 1600,670 M 0,100 L 1400,670 M 0,200 L 1200,670 M 200,0 L 1600,570" stroke="#ECE5D8" strokeWidth="1" strokeDasharray="5 5" />

                {/* ---------------- CAMPUS WINDING PATH / MAIN ROAD ---------------- */}
                {/* Thick under-road shadow */}
                <path 
                  d="M 50,550 C 150,510 200,480 280,470 C 350,460 380,410 440,390 C 500,370 480,320 540,300 C 600,280 620,290 670,300 C 720,310 740,360 800,360 C 860,360 900,320 960,300 C 1020,280 1050,260 1110,260 C 1170,260 1200,280 1260,280 C 1320,280 1380,260 1450,260" 
                  fill="none" 
                  stroke="#1c1b1b" 
                  strokeWidth="22" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                {/* Main Road Surface */}
                <path 
                  d="M 50,550 C 150,510 200,480 280,470 C 350,460 380,410 440,390 C 500,370 480,320 540,300 C 600,280 620,290 670,300 C 720,310 740,360 800,360 C 860,360 900,320 960,300 C 1020,280 1050,260 1110,260 C 1170,260 1200,280 1260,280 C 1320,280 1380,260 1450,260" 
                  fill="none" 
                  stroke="#EBE5DA" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                {/* Dash Center Line */}
                <path 
                  d="M 50,550 C 150,510 200,480 280,470 C 350,460 380,410 440,390 C 500,370 480,320 540,300 C 600,280 620,290 670,300 C 720,310 740,360 800,360 C 860,360 900,320 960,300 C 1020,280 1050,260 1110,260 C 1170,260 1200,280 1260,280 C 1320,280 1380,260 1450,260" 
                  fill="none" 
                  stroke="#1c1b1b" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeDasharray="6 6" 
                />

                {/* ---------------- LANDMARK: MAIN ENTRANCE (Left End) ---------------- */}
                <g transform="translate(50, 520)">
                  {/* Base / Guardhouse */}
                  <rect x="-15" y="-10" width="30" height="20" fill="#1c1b1b" />
                  <rect x="-13" y="-12" width="26" height="20" fill="#e9ecef" stroke="#1c1b1b" strokeWidth="2" />
                  {/* Gate pillars */}
                  <line x1="-25" y1="20" x2="-25" y2="-20" stroke="#1c1b1b" strokeWidth="3" />
                  <line x1="25" y1="20" x2="25" y2="-20" stroke="#1c1b1b" strokeWidth="3" />
                  <text x="0" y="25" fill="#1c1b1b" className="font-mono text-[8px] font-black uppercase text-center" textAnchor="middle">ENTRANCE</text>
                </g>

                {/* ---------------- LANDMARK: PARKING LOT ---------------- */}
                <g transform="translate(280, 480)">
                  {/* Grid Lot Area */}
                  <polygon points="-40,-20 40,-20 30,20 -50,20" fill="#E5DEC9" stroke="#1c1b1b" strokeWidth="2.5" />
                  {/* Parking Lines */}
                  <line x1="-30" y1="-15" x2="-38" y2="15" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="-15" y1="-15" x2="-22" y2="15" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="0" y1="-15" x2="-6" y2="15" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="15" y1="-15" x2="10" y2="15" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="30" y1="-15" x2="25" y2="15" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="-5" y="32" fill="#1c1b1b" className="font-mono text-[8px] font-black uppercase tracking-wider" textAnchor="middle">PARKING LOT</text>
                </g>

                {/* ---------------- LANDMARK: AMPHITHEATRE ---------------- */}
                <g transform="translate(440, 360)">
                  {/* Concentric Step Arcs */}
                  <path d="M -35,5 A 35,25 0 0,1 35,5" fill="none" stroke="#1c1b1b" strokeWidth="6" />
                  <path d="M -25,0 A 25,18 0 0,1 25,0" fill="none" stroke="#1c1b1b" strokeWidth="5" />
                  <path d="M -15,-5 A 15,10 0 0,1 15,-5" fill="none" stroke="#1c1b1b" strokeWidth="4" />
                  {/* Stage Base */}
                  <ellipse cx="0" cy="12" rx="18" ry="8" fill="#ffdeeb" stroke="#1c1b1b" strokeWidth="2.5" />
                  <text x="0" y="28" fill="#1c1b1b" className="font-mono text-[8px] font-black uppercase tracking-wider" textAnchor="middle">AMPHITHEATRE</text>
                </g>

                {/* ---------------- LANDMARK: CENTRAL LIBRARY ---------------- */}
                <g transform="translate(670, 180)">
                  {/* Shadow base */}
                  <ellipse cx="0" cy="15" rx="35" ry="18" fill="#1c1b1b" />
                  {/* Dome cylinder walls */}
                  <rect x="-30" y="-15" width="60" height="25" fill="url(#lib-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Dome roof */}
                  <path d="M -30,-15 A 30,22 0 0,1 30,-15 Z" fill="url(#lib-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Column pillars details */}
                  <line x1="-20" y1="-15" x2="-20" y2="10" stroke="#1c1b1b" strokeWidth="1.5" />
                  <line x1="-10" y1="-15" x2="-10" y2="10" stroke="#1c1b1b" strokeWidth="1.5" />
                  <line x1="10" y1="-15" x2="10" y2="10" stroke="#1c1b1b" strokeWidth="1.5" />
                  <line x1="20" y1="-15" x2="20" y2="10" stroke="#1c1b1b" strokeWidth="1.5" />
                </g>

                {/* ---------------- LANDMARK: ACADEMIC BLOCK (D & E) ---------------- */}
                <g transform="translate(560, 260)">
                  {/* Shadow polygon */}
                  <polygon points="-45,20 0,40 45,20 45,-20 0,-40 -45,-20" fill="#1c1b1b" transform="translate(4, 4)" />
                  {/* Left block wall */}
                  <polygon points="-40,0 -40,30 0,50 0,20" fill="url(#academic-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Right block wall */}
                  <polygon points="0,20 0,50 40,30 40,0" fill="#f59f00" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Top roof */}
                  <polygon points="-40,0 0,-20 40,0 0,20" fill="url(#academic-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  
                  {/* Inner courtyard details */}
                  <polygon points="-20,-5 0,-15 20,-5 0,5" fill="#f4f0ea" stroke="#1c1b1b" strokeWidth="1.5" />
                </g>

                {/* ---------------- LANDMARK: TRADE TOWER ---------------- */}
                <g transform="translate(670, 340)">
                  {/* Shadow */}
                  <polygon points="-25,45 25,45 25,-10 -25,-10" fill="#1c1b1b" transform="translate(3, 3)" />
                  {/* Left wall */}
                  <polygon points="-20,20 -20,60 0,70 0,30" fill="url(#trade-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Right wall */}
                  <polygon points="0,30 0,70 20,60 20,20" fill="#0b7285" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Top slanted roof */}
                  <polygon points="-20,20 0,-15 20,20 0,30" fill="url(#trade-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  
                  {/* Glass pane details */}
                  <line x1="-10" y1="25" x2="-10" y2="55" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="10" y1="25" x2="10" y2="55" stroke="#1c1b1b" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>

                {/* ---------------- LANDMARK: ADMIN BLOCK & LT ---------------- */}
                <g transform="translate(560, 450)">
                  {/* Shadow */}
                  <polygon points="-35,15 35,15 35,-15 -35,-15" fill="#1c1b1b" transform="translate(3, 3)" />
                  {/* Left wall */}
                  <polygon points="-30,10 -30,40 0,50 0,20" fill="url(#admin-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Right wall */}
                  <polygon points="0,20 0,50 30,40 30,10" fill="#c92a2a" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Top roof */}
                  <polygon points="-30,10 0,-10 30,10 0,20" fill="url(#admin-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Tiered upper tower */}
                  <polygon points="-15,0 0,-10 15,0 0,10" fill="#ffd43b" stroke="#1c1b1b" strokeWidth="2" />
                  <line x1="0" y1="10" x2="0" y2="25" stroke="#1c1b1b" strokeWidth="2" />
                </g>

                {/* ---------------- LANDMARK: HOSTEL TOWERS ---------------- */}
                <g transform="translate(1000, 200)">
                  {/* Shadow */}
                  <rect x="-35" y="-35" width="70" height="70" fill="#1c1b1b" transform="translate(4, 4)" />
                  {/* Tower 1 */}
                  <rect x="-30" y="-30" width="25" height="60" fill="url(#hostel-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  <rect x="-30" y="-35" width="25" height="5" fill="url(#hostel-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Tower 2 */}
                  <rect x="5" y="-15" width="25" height="45" fill="url(#hostel-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  <rect x="5" y="-20" width="25" height="5" fill="url(#hostel-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  
                  {/* Window Grid lines */}
                  <line x1="-22" y1="-20" x2="-22" y2="20" stroke="#1c1b1b" strokeWidth="1" strokeDasharray="2 4" />
                  <line x1="-12" y1="-20" x2="-12" y2="20" stroke="#1c1b1b" strokeWidth="1" strokeDasharray="2 4" />
                  <line x1="12" y1="-5" x2="12" y2="25" stroke="#1c1b1b" strokeWidth="1" strokeDasharray="2 4" />
                  <line x1="22" y1="-5" x2="22" y2="25" stroke="#1c1b1b" strokeWidth="1" strokeDasharray="2 4" />
                  <text x="0" y="42" fill="#1c1b1b" className="font-mono text-[8px] font-black uppercase text-center" textAnchor="middle">HOSTEL TOWERS</text>
                </g>

                {/* ---------------- LANDMARK: RACE ATHLETIC TRACK ---------------- */}
                <g transform="translate(1140, 160)">
                  {/* Track base */}
                  <ellipse cx="0" cy="0" rx="75" ry="40" fill="#db706f" stroke="#1c1b1b" strokeWidth="4.5" />
                  {/* Inner soccer field green */}
                  <ellipse cx="0" cy="0" rx="58" ry="25" fill="#52b788" stroke="#1c1b1b" strokeWidth="3" />
                  {/* Soccer field white outline details */}
                  <ellipse cx="0" cy="0" rx="40" ry="15" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                  <line x1="0" y1="-25" x2="0" y2="25" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="0" cy="0" r="8" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                </g>

                {/* ---------------- LANDMARK: OVAL DINING HALL ---------------- */}
                <g transform="translate(1180, 230)">
                  <circle cx="0" cy="0" r="22" fill="#1c1b1b" transform="translate(2, 2)" />
                  <circle cx="0" cy="0" r="22" fill="#ffe3e3" stroke="#1c1b1b" strokeWidth="3" />
                  <circle cx="0" cy="0" r="16" fill="url(#lib-roof)" stroke="#1c1b1b" strokeWidth="2" />
                  <text x="0" y="32" fill="#1c1b1b" className="font-mono text-[7px] font-black text-center" textAnchor="middle">OVAL DINING</text>
                </g>

                {/* ---------------- LANDMARK: THE LEAGUE / SPORTX ---------------- */}
                <g transform="translate(1260, 160)">
                  {/* Shadow */}
                  <rect x="-35" y="-25" width="70" height="50" fill="#1c1b1b" transform="translate(3, 3)" />
                  {/* Sports court arena */}
                  <rect x="-35" y="-25" width="70" height="50" fill="#4ea8de" stroke="#1c1b1b" strokeWidth="3.5" />
                  {/* Grid layouts inside */}
                  <line x1="-35" y1="0" x2="35" y2="0" stroke="#ffffff" strokeWidth="2" />
                  <line x1="0" y1="-25" x2="0" y2="25" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="-25" y="-18" width="50" height="36" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                </g>

                {/* ---------------- LANDMARK: CRICKET GROUND (Right End) ---------------- */}
                <g transform="translate(1450, 240)">
                  {/* Large outfield circle */}
                  <circle cx="0" cy="0" r="70" fill="#1c1b1b" transform="translate(3, 3)" />
                  <circle cx="0" cy="0" r="70" fill="#74c69d" stroke="#1c1b1b" strokeWidth="4" />
                  {/* Pitch square */}
                  <rect x="-10" y="-18" width="20" height="36" fill="#e9ecef" stroke="#1c1b1b" strokeWidth="2" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#1c1b1b" strokeWidth="1.5" />
                  <text x="0" y="82" fill="#1c1b1b" className="font-mono text-[8px] font-black uppercase text-center" textAnchor="middle">CRICKET GROUND</text>
                </g>

                {/* ---------------- LANDMARK: STUDENT HOSTELS ---------------- */}
                <g transform="translate(1220, 340)">
                  {/* Shadow */}
                  <polygon points="-40,10 40,10 20,45 -20,45" fill="#1c1b1b" transform="translate(3, 3)" />
                  {/* Hostel cluster building shapes */}
                  <rect x="-35" y="0" width="30" height="25" fill="url(#hostel-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  <rect x="5" y="0" width="30" height="25" fill="url(#hostel-wall)" stroke="#1c1b1b" strokeWidth="3" />
                  <polygon points="-35,0 -20,-15 5,-15 -10,0" fill="url(#hostel-roof)" stroke="#1c1b1b" strokeWidth="3" />
                  <polygon points="5,0 20,-15 45,-15 30,0" fill="url(#hostel-roof)" stroke="#1c1b1b" strokeWidth="3" />
                </g>
              </svg>

              {/* Interactive Hotspots Overlaid on Vector Map Coordinates */}
              {HOTSPOTS.map((spot) => {
                const isBlinking = activeVenue === spot.id;
                const isSelected = filterVenue === spot.id;

                return (
                  <button
                    key={spot.id}
                    onClick={() => handleBlockClick(spot.id)}
                    className="absolute group pointer-events-auto cursor-pointer"
                    style={{
                      left: `${spot.x}px`,
                      top: `${spot.y}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isBlinking || isSelected ? 50 : 30
                    }}
                  >
                    {/* Pulsing Target Ring */}
                    <span className={`absolute -inset-6 rounded-full border-4 border-dashed border-brand-primary opacity-0 group-hover:opacity-75 group-hover:animate-spin-slow transition-all duration-300 ${isBlinking ? 'opacity-100 animate-spin-slow' : ''}`}></span>
                    
                    {/* Outer Blinking pulse radar */}
                    {isBlinking && (
                      <span className="absolute -inset-8 rounded-full bg-brand-primary opacity-25 animate-ping"></span>
                    )}

                    {/* Badge pin button */}
                    <div className={`px-3 py-1.5 border-2 border-brand-on-surface font-display font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all ${
                      isSelected || isBlinking
                        ? 'bg-brand-primary text-brand-on-primary scale-110'
                        : 'bg-brand-surface text-brand-on-surface group-hover:bg-brand-mustard group-hover:text-brand-on-surface'
                    }`}>
                      {spot.label}
                    </div>

                    {/* Point Marker dot */}
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-brand-on-surface mx-auto mt-1 transition-all ${
                      isSelected || isBlinking
                        ? 'bg-brand-primary animate-bounce'
                        : 'bg-brand-secondary group-hover:bg-brand-primary'
                    }`} />
                  </button>
                );
              })}

              {/* Bouncing Pin and Pulse Ring for Located/Active venue */}
              {activeVenue && VENUE_COORDS[activeVenue] && (
                <div 
                  className="absolute pointer-events-none z-50 flex flex-col items-center font-mono"
                  style={{
                    left: `${VENUE_COORDS[activeVenue].x}px`,
                    top: `${VENUE_COORDS[activeVenue].y - 35}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  {/* Sonar Ring */}
                  <span className="absolute w-16 h-16 -bottom-8 rounded-full border-4 border-brand-primary animate-ping" />
                  
                  {/* Bouncing Pin */}
                  <div className="animate-bounce flex flex-col items-center">
                    <div className="bg-[#e03131] border-2 border-brand-on-surface p-1 px-2 text-[8px] font-black text-white uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                      LOCKED TARGET
                    </div>
                    <div className="w-3 h-3 bg-[#e03131] border-r-2 border-b-2 border-brand-on-surface rotate-45 -mt-1.5" />
                  </div>
                </div>
              )}
            </div>
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
