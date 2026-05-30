// Main Landing Page & Participant Dashboard (Bauhaus Theme)
// Location: src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Award, 
  BookOpen, 
  Clock, 
  Compass, 
  HelpCircle, 
  MapPin, 
  QrCode, 
  Trophy, 
  Zap,
  X,
  Camera,
  AlertCircle,
  LogIn
} from 'lucide-react';

const getBarrelIdFromCode = (code: string): number | null => {
  const normalized = code.trim().toUpperCase();
  // Check NASA08xx style:
  if (normalized.startsWith('NASA08')) {
    const numPart = parseInt(normalized.slice(6), 10);
    if (numPart >= 1 && numPart <= 10) return numPart;
  }
  // Check numeric mappings:
  const numericMap: { [code: string]: number } = {
    '48392015': 1,
    '89201543': 2,
    '31548920': 3,
    '54389201': 4,
    '92015438': 5,
    '15438920': 6,
    '83920154': 7,
    '43892015': 8,
    '20154389': 9,
    '71543892': 10
  };
  return numericMap[normalized] || null;
};

interface Participant {
  id: string;
  full_name: string;
  college_name: string;
  registration_id: string;
}

interface Progress {
  completed_quizzes: number;
  total_score: number;
  total_time: number;
  next_barrel_id: number | null;
  current_attempt_id: string | null;
}

export default function Home() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  // QR Scanner & Manual Code states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualCodeError, setManualCodeError] = useState<string | null>(null);

  const resetScannerState = () => {
    setScannerError(null);
    setShowCodeInput(false);
    setManualCode('');
    setManualCodeError(null);
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
    resetScannerState();
  };

  const handleScanSuccess = (decodedText: string) => {
    // Parse URL target (e.g. /barrel/3)
    const match = decodedText.match(/\/barrel\/(\d+)/);
    if (match) {
      const bId = parseInt(match[1], 10);
      if (bId >= 1 && bId <= 10) {
        setIsScannerOpen(false);
        resetScannerState();
        router.push(`/barrel/${bId}`);
        return;
      }
    }

    // Try parsing raw number (e.g. 3)
    const rawNum = parseInt(decodedText.trim(), 10);
    if (!isNaN(rawNum) && rawNum >= 1 && rawNum <= 10) {
      setIsScannerOpen(false);
      resetScannerState();
      router.push(`/barrel/${rawNum}`);
      return;
    }

    // Try parsing 8 digit code
    const detectedBId = getBarrelIdFromCode(decodedText);
    if (detectedBId) {
      setIsScannerOpen(false);
      resetScannerState();
      router.push(`/barrel/${detectedBId}`);
      return;
    }

    alert(`Scanned content: "${decodedText}". Does not match a valid target barrel format.`);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError(null);

    const code = manualCode.trim();
    if (code.length !== 8) {
      setManualCodeError("ACCESS CODE MUST BE EXACTLY 8 CHARACTERS.");
      return;
    }

    const detectedBId = getBarrelIdFromCode(code);
    if (detectedBId) {
      setIsScannerOpen(false);
      resetScannerState();
      router.push(`/barrel/${detectedBId}`);
    } else {
      setManualCodeError("INVALID 8-DIGIT ACCESS KEY. VERIFY PHYSICAL BARREL.");
    }
  };

  useEffect(() => {
    if (!isScannerOpen || showCodeInput) return;

    let html5QrCode: any = null;
    let isActive = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isActive) return;

        html5QrCode = new Html5Qrcode("qr-reader-target");
        setScannerError(null);

        const qrCodeSuccessCallback = (decodedText: string) => {
          if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              handleScanSuccess(decodedText);
            }).catch((err: any) => {
              console.error("Failed to stop scanner cleanly:", err);
              handleScanSuccess(decodedText);
            });
          } else {
            handleScanSuccess(decodedText);
          }
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          qrCodeSuccessCallback,
          () => {
            // Keep scanning silently
          }
        );
      } catch (err: any) {
        console.error("QR Scanner Init Error:", err);
        if (isActive) {
          setScannerError(err?.message || "Could not access video input. Make sure camera permissions are enabled.");
        }
      }
    };

    startScanner();

    return () => {
      isActive = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: any) => console.error("Scanner stop cleanup error:", err));
      }
    };
  }, [isScannerOpen, showCodeInput]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setParticipant(data.participant);
          setProgress(data.progress);
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center text-brand-on-surface">
        <Compass className="h-12 w-12 text-brand-primary animate-spin mb-4" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest">LOADING BLUEPRINTS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pb-32">
        {participant && progress ? (
          // -------------------------------------------------------------
          // PARTICIPANT SIGNED IN VIEW
          // -------------------------------------------------------------
          <div className="space-y-8 animate-fade-in">
            {/* Page Title & Status */}
            <div className="border-b-4 border-brand-on-surface inline-block pr-12 pb-2">
              <span className="font-mono text-xs font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block">
                PARTICIPANT STATUS
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface tracking-tight mt-1">
                WELCOME BACK, <br />
                <span className="text-brand-primary">{participant.full_name}</span>
              </h2>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-brand-surface border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] p-6 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
                  REGISTRATION NO.
                </span>
                <span className="font-display text-2xl font-black text-brand-primary mt-2">
                  {participant.registration_id}
                </span>
              </div>

              <div className="bg-brand-surface border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] p-6 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
                  TOTAL SCORE
                </span>
                <span className="font-display text-3xl font-black text-brand-secondary mt-2">
                  {progress.total_score} XP
                </span>
              </div>

              <div className="bg-brand-surface border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] p-6 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
                  ACCUMULATED HUNT TIME
                </span>
                <span className="font-display text-3xl font-black text-brand-on-surface mt-2 font-mono">
                  {formatTime(progress.total_time)}
                </span>
              </div>
            </div>

            {/* Progress & Targets Area */}
            {progress.completed_quizzes < 10 && progress.next_barrel_id ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Next Target Clue Card (8 cols) */}
                <div className="lg:col-span-8 bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col justify-between">
                  {/* Card Header Block */}
                  <div className="bg-brand-secondary p-4 border-b-4 border-brand-on-surface flex justify-between items-center text-brand-on-secondary">
                    <h3 className="font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                      <MapPin className="h-4 w-4 animate-bounce" />
                      ACTIVE TARGET PORTAL
                    </h3>
                    <span className="font-mono text-xs font-bold">NODE #{progress.next_barrel_id}</span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 md:p-8 space-y-6">
                    <h2 className="font-display text-3xl font-black text-brand-on-surface leading-tight">
                      Scan Barrel #{progress.next_barrel_id} to Unlock Next Quiz
                    </h2>
                    
                    <p className="font-sans text-brand-on-surface-variant leading-relaxed text-sm md:text-base">
                      Find the physical barrel marked with identifier <strong className="text-brand-primary">#{progress.next_barrel_id}</strong> positioned around the venue. Use your phone camera to scan its QR code. Your sequence is dynamically locked and verified by the server clock.
                    </p>

                    <div className="p-4 bg-brand-surface-low border-l-4 border-brand-mustard text-brand-on-surface">
                      <span className="font-mono text-xs font-bold block text-brand-on-surface-variant">BARREL LOCATION CLUE</span>
                      <p className="font-sans font-bold italic mt-1 text-sm text-brand-on-surface">
                        {progress.next_barrel_id === 1 && "Start near the main registration lobby where heritage blueprints are displayed."}
                        {progress.next_barrel_id === 2 && "Positioned near the School of Planning & Architecture studio entry."}
                        {progress.next_barrel_id === 3 && "Near the open-air amphitheater steps where discussions meet design."}
                        {progress.next_barrel_id === 4 && "Explore the central architectural model exhibition arcade."}
                        {progress.next_barrel_id === 5 && "Located in the courtyard between the design workshop and main labs."}
                        {progress.next_barrel_id === 6 && "Check the structural gallery highlighting vernacular architecture patterns."}
                        {progress.next_barrel_id === 7 && "Located near the masonry restoration and material testing shed."}
                        {progress.next_barrel_id === 8 && "Find this near the modernist concrete framing structural models."}
                        {progress.next_barrel_id === 9 && "Check the hydraulic model stepwell structure replica on campus."}
                        {progress.next_barrel_id === 10 && "Final destination, positioned near the Moazzam Jahi exhibition dome."}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions/Footer */}
                  <div className="p-6 border-t-2 border-brand-on-surface bg-brand-surface-low flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="text-xs font-mono font-bold text-brand-on-surface-variant">
                      LOCKED TARGET ROUTING SYSTEM
                    </div>
                    
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-6 py-3.5 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" />
                      Scan Barrel #{progress.next_barrel_id}
                    </button>
                  </div>
                </div>

                {/* 2. Step Progress Block (4 cols) */}
                <div className="lg:col-span-4 bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col justify-between">
                  {/* Header */}
                  <div className="bg-brand-on-surface p-4 border-b-4 border-brand-on-surface flex justify-between items-center text-brand-surface">
                    <h3 className="font-mono text-xs font-bold tracking-widest uppercase">
                      HUNT PROGRESSION
                    </h3>
                    <Compass className="h-4 w-4 text-brand-mustard" />
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase">
                        Barrels Decoded
                      </span>
                      <span className="font-display text-2xl font-black text-brand-on-surface">
                        {progress.completed_quizzes} / 10
                      </span>
                    </div>

                    {/* Step-block progress bar */}
                    <div className="flex gap-1 h-8">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const isDone = i < progress.completed_quizzes;
                        return (
                          <div 
                            key={i} 
                            className={`flex-1 border-2 border-brand-on-surface transition ${
                              isDone ? 'bg-brand-secondary' : 'bg-brand-surface-highest opacity-40'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-brand-outline-variant text-xs text-brand-on-surface-variant leading-relaxed">
                      <div className="flex gap-2">
                        <span className="font-bold text-brand-secondary">✓</span>
                        <span>Points contribute to your college and individual scoreboard standing.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-brand-primary">!</span>
                        <span>Wrong barrels scanned out of sequence will trigger automatic security audit logs.</span>
                      </div>
                    </div>
                  </div>

                  {/* Footnote block */}
                  <div className="p-4 bg-brand-surface-container border-t-2 border-brand-on-surface font-mono text-[10px] text-center text-brand-on-surface-variant">
                    68th ANNUAL CONVENTION • WOXSEN UNIVERSITY
                  </div>
                </div>
              </div>
            ) : (
              // -------------------------------------------------------------
              // HUNT COMPLETED STATUS
              // -------------------------------------------------------------
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden">
                {/* Bauhaus Accent Squares */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-mustard border-b-2 border-l-2 border-brand-on-surface -z-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-secondary border-t-2 border-r-2 border-brand-on-surface -z-10"></div>

                <div className="inline-flex p-4 bg-brand-mustard border-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] text-brand-on-surface">
                  <Trophy className="h-12 w-12 animate-bounce" />
                </div>

                <h2 className="font-display text-4xl font-black uppercase text-brand-on-surface leading-none">
                  Architectural Quest Completed
                </h2>
                
                <p className="font-sans text-brand-on-surface-variant text-base leading-relaxed max-w-md mx-auto">
                  Outstanding performance, <strong className="text-brand-primary uppercase">{participant.full_name}</strong>! You successfully located and scanned all 10 heritage barrels on campus.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-4">
                  <div className="bg-brand-surface border-2 border-brand-on-surface p-4 text-center">
                    <span className="font-mono text-[10px] text-brand-on-surface-variant uppercase block">Final Score</span>
                    <strong className="font-display text-2xl font-black text-brand-primary">{progress.total_score} XP</strong>
                  </div>
                  <div className="bg-brand-surface border-2 border-brand-on-surface p-4 text-center">
                    <span className="font-mono text-[10px] text-brand-on-surface-variant uppercase block">Total Duration</span>
                    <strong className="font-display text-2xl font-black text-brand-secondary font-mono">{formatTime(progress.total_time)}</strong>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Link
                    href="/leaderboard"
                    className="px-8 py-4 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    View Live Standing
                  </Link>
                </div>
              </div>
            )}

            {/* General Rules Info Cards */}
            <div className="bg-brand-surface-container border-2 border-brand-on-surface p-6">
              <h3 className="font-display text-lg font-bold text-brand-on-surface mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-primary" />
                Hunt Code of Conduct
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-brand-on-surface-variant">
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-brand-primary">1. Physical Nodes</h4>
                  <p className="leading-relaxed">
                    Do not move, deface, or cover the physical QR barrels. Doing so will lead to instant team disqualification.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-brand-primary">2. Timing Rule</h4>
                  <p className="leading-relaxed">
                    Your timing logs are clocked by the server. Bypassing client-side countdown limits has no effect on database scores.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-brand-primary">3. Verification</h4>
                  <p className="leading-relaxed">
                    Admins check the event logs to verify that scans match physical movement routes before awards are confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // -------------------------------------------------------------
          // PUBLIC VISITOR VIEW (LANDING PAGE)
          // -------------------------------------------------------------
          <div className="space-y-16 py-8">
            {/* Bento Grid Header */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-brand-primary p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col justify-end min-h-[400px]">
                <span className="font-mono text-xs font-bold text-brand-surface-highest mb-4 uppercase tracking-widest">
                  Woxsen University x NASA India
                </span>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-brand-on-primary mb-6 leading-none uppercase">
                  QR QUIZ <br />
                  HUNT 2026
                </h1>
                <p className="font-sans text-brand-surface-highest text-sm sm:text-base max-w-xl leading-relaxed">
                  Embark on an immersive architectural discovery contest across the Woxsen campus. Decode structural blueprints, scan hidden physical barrel nodes, and resolve Deccani heritage quizzes.
                </p>
              </div>

              <div className="md:col-span-4 grid grid-rows-2 gap-6">
                <div className="bg-brand-secondary p-6 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center text-center text-brand-on-secondary">
                  <Compass className="h-16 w-16 text-brand-secondary-container mb-2 animate-spin-slow" />
                  <h3 className="font-display text-lg font-black uppercase tracking-wider">The Challenge</h3>
                </div>
                <div className="bg-brand-mustard p-6 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center text-center text-brand-on-surface">
                  <h2 className="font-display text-5xl font-black mb-0">10</h2>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider">Barrel Stations</p>
                </div>
              </div>
            </section>

            {/* Call to Action Button */}
            <section className="flex flex-col items-center py-4">
              <div className="flex flex-col sm:flex-row gap-6 mt-4 items-center w-full justify-center px-4">
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-brand-primary text-brand-on-primary border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] hover:shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto"
                >
                  <span className="font-display text-lg font-black uppercase tracking-widest">Start Hunt</span>
                  <QrCode className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="group px-8 py-4 bg-brand-surface text-brand-on-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] hover:shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto"
                >
                  <span className="font-display text-lg font-black uppercase tracking-widest">Resume Session</span>
                  <LogIn className="h-5 w-5" />
                </Link>
              </div>
              <p className="font-mono text-[10px] text-brand-on-surface-variant uppercase mt-6 tracking-widest">
                Camera permission required for local scanning
              </p>
            </section>

            {/* Event Guidelines (Modular Rule Blocks) */}
            <section>
              <div className="mb-8 border-b-4 border-brand-on-surface inline-block pr-12">
                <h2 className="font-display text-2xl font-black text-brand-on-surface uppercase">
                  THE CONTEST RULES
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Locate the Node", desc: "Identify the physical architectural barrels hidden throughout the Woxsen University School of Architecture & Planning campus.", color: "bg-brand-secondary" },
                  { step: "02", title: "Scan & Answer", desc: "Use the in-app scanner to unlock location-based architectural quizzes. Each correct answer gains you 10 convention points.", color: "bg-brand-primary" },
                  { step: "03", title: "Scale the Standing", desc: "Results update live on the standings board. Tied scores are broken by fastest server-clock submission time.", color: "bg-brand-mustard" }
                ].map((rule, idx) => (
                  <div key={idx} className="bg-brand-surface-low border-2 border-brand-on-surface p-6 flex flex-col gap-4 relative overflow-hidden">
                    <div className={`absolute -top-4 -right-4 w-12 h-12 ${rule.color} border-b-2 border-l-2 border-brand-on-surface transform rotate-45`}></div>
                    <span className="font-mono text-xl font-bold text-brand-primary">{rule.step}</span>
                    <h4 className="font-display text-lg font-bold text-brand-on-surface">{rule.title}</h4>
                    <p className="text-sm text-brand-on-surface-variant leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Map Area */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] aspect-video bg-brand-surface-highest overflow-hidden">
                  <img 
                    alt="Campus site map rendering" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk5BF-a4hKn9rDY40ynd6mV0BK79zCaRJaK7aIa5mqq-B216r95i9MnNeRRcNSfPwBHwYqtGOOB7UNOMK1zcQTM84l_Wbwzm9vg9dXEQdcHoacDiKCNMwvy3E6BNcaP-Bp1lvwTwPbLgZTOQ-jlOGLCAOUJ09EdAs5nQ8B05vVgRiHFDAZtAm01s7Suqe4l5QU8OtGl_45SOJH7FvwItVJazc7ON0xqebq--EMdVJN8d04BZ_bq360PgZBAVAzQAJXQZ0k4tfWMak"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500" 
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-brand-on-surface text-brand-surface px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-brand-on-surface">
                  Hyderabad Campus Sector 4
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-brand-on-surface uppercase mb-4 underline decoration-brand-secondary decoration-8">
                  THE CANVAS
                </h3>
                <p className="text-brand-on-surface-variant leading-relaxed text-base mb-6">
                  Woxsen University's architecture is a testament to sustainable modernism. The hunt spans the central library, the design studios, stepwells, and open-air amphitheaters. Decode structural history in place!
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Sustainability", "Geometry", "Modernism", "Acoustics"].map((tag) => (
                    <span key={tag} className="px-3 py-1 border border-brand-on-surface font-mono text-xs font-bold uppercase text-brand-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer Sponsor Strips */}
      <footer className="bg-brand-surface-highest border-t-4 border-brand-on-surface py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-90 transition-opacity">
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-brand-on-surface-variant mb-1 uppercase">HOSTED BY</span>
              <span className="font-display font-black text-brand-on-surface text-lg">WOXSEN UNIVERSITY</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-brand-on-surface-variant mb-1 uppercase">POWERED BY</span>
              <span className="font-display font-black text-brand-on-surface text-lg uppercase text-brand-secondary">Catalyse</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-brand-on-surface-variant mb-1 uppercase">ORGANIZED BY</span>
              <span className="font-display font-black text-brand-on-surface text-lg">NASA INDIA</span>
            </div>
          </div>
          
          <div className="flex gap-6 mt-4">
            <a href="#" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">NASA India</a>
            <span className="text-brand-outline-variant">•</span>
            <a href="#" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">Catalyse</a>
            <span className="text-brand-outline-variant">•</span>
            <a href="#" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">Support</a>
          </div>

          <p className="font-mono text-[10px] text-brand-on-surface-variant mt-4 font-bold">
            68th ANNUAL NASA CONVENTION x WOXSEN UNIVERSITY © 2026
          </p>
        </div>
      </footer>
      {/* QR SCANNER & CODE INPUT MODAL OVERLAY */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface max-w-md w-full border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseScanner}
              className="absolute -top-3 -right-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface p-2 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              title="Close Scanner"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Content */}
            {!showCodeInput ? (
              // CAMERA/SCANNER STATE
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] font-bold bg-brand-secondary text-brand-on-secondary px-2.5 py-0.5 uppercase tracking-wider">
                    Target Identification
                  </span>
                  <h3 className="font-display text-xl font-black uppercase text-brand-on-surface mt-1.5 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-brand-primary" />
                    Live Camera QR Scan
                  </h3>
                </div>

                {scannerError ? (
                  // Camera Failed Options View
                  <div className="space-y-6">
                    <div className="p-4 border-2 border-brand-error bg-red-50 text-brand-error flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] font-bold uppercase block">CAMERA ACCESS FAILURE</span>
                        <p className="font-mono text-xs leading-relaxed">{scannerError}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <button
                        onClick={() => setScannerError(null)}
                        className="py-3 bg-brand-surface border-2 border-brand-on-surface font-display font-bold text-xs uppercase shadow-[2.5px_2.5px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        Retry QR (Start Camera)
                      </button>
                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="py-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase shadow-[2.5px_2.5px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        Enter Code Manually
                      </button>
                    </div>
                  </div>
                ) : (
                  // Live Scan Feed view
                  <div className="space-y-6">
                    <div className="border-4 border-brand-on-surface bg-black aspect-square overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                      <div id="qr-reader-target" className="w-full h-full"></div>
                      {/* Scanning crosshair marker overlay */}
                      <div className="absolute inset-0 border-[35px] border-black/35 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-brand-mustard animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="flex-1 py-3 bg-brand-surface border-2 border-brand-on-surface font-mono font-bold text-[10px] uppercase hover:bg-brand-surface-low transition-all cursor-pointer"
                      >
                        Enter Code Manually
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // MANUAL CODE INPUT STATE
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] font-bold bg-brand-mustard text-brand-on-surface px-2.5 py-0.5 uppercase tracking-wider">
                    Verification Failback
                  </span>
                  <h3 className="font-display text-xl font-black uppercase text-brand-on-surface mt-1.5 flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-brand-secondary" />
                    Enter Access Code
                  </h3>
                  <p className="text-[11px] text-brand-on-surface-variant font-mono mt-1 uppercase">
                    Provide the 8-digit key printed physically on the target barrel.
                  </p>
                </div>

                <form onSubmit={handleManualCodeSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={8}
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.slice(0, 8))}
                      placeholder="NASAXXXX (OR NUMERIC)"
                      className="w-full input-brutalist px-4 py-3 text-center text-base font-mono font-black uppercase tracking-widest placeholder:text-brand-outline-variant placeholder:opacity-40"
                      required
                      autoFocus
                    />
                    {manualCodeError && (
                      <span className="text-[10px] font-mono font-bold text-brand-error block mt-1.5 uppercase">
                        {manualCodeError}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCodeInput(false);
                        setScannerError(null);
                      }}
                      className="py-3 bg-brand-surface border-2 border-brand-on-surface font-display font-bold text-xs uppercase hover:bg-brand-surface-low transition-all cursor-pointer"
                    >
                      Scan QR Instead
                    </button>
                    <button
                      type="submit"
                      className="py-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-bold text-xs uppercase shadow-[2.5px_2.5px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    >
                      Verify Key
                    </button>
                  </div>
                </form>

                {/* Helper details showing testing keys */}
                <div className="p-3 bg-brand-surface-low border border-brand-on-surface text-[9px] font-mono text-brand-on-surface-variant space-y-1">
                  <span className="font-bold text-brand-primary uppercase block">TESTING SIMULATOR PASSWORDS:</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <span>Barrel 1: NASA0801</span>
                    <span>Barrel 2: NASA0802</span>
                    <span>Barrel 3: NASA0803</span>
                    <span>Barrel 4: NASA0804</span>
                    <span>Barrel 5: NASA0805</span>
                    <span>Barrel 6: NASA0806</span>
                    <span>Barrel 7: NASA0807</span>
                    <span>Barrel 8: NASA0808</span>
                    <span>Barrel 9: NASA0809</span>
                    <span>Barrel 10: NASA0810</span>
                  </div>
                  <span className="block mt-1 font-bold text-[8px] text-brand-on-surface-variant opacity-85">
                    * Use uppercase keys to simulate successful barrel physical locates.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
