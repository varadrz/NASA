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

const BARREL_CODES: { [key: number]: string } = {
  1: '48392015',
  2: '89201543',
  3: '31548920',
  4: '54389201',
  5: '92015438',
  6: '15438920',
  7: '83920154',
  8: '43892015',
  9: '20154389',
  10: '71543892',
  11: '62940183',
  12: '30958174',
  13: '84920173',
  14: '15948302',
  15: '93018472',
  16: '48201937',
  17: '75039182',
  18: '29481037',
  19: '58392014',
  20: '10394827'
};

const getBarrelIdFromCode = (code: string): number | null => {
  const normalized = code.trim();
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
    '71543892': 10,
    '62940183': 11,
    '30958174': 12,
    '84920173': 13,
    '15948302': 14,
    '93018472': 15,
    '48201937': 16,
    '75039182': 17,
    '29481037': 18,
    '58392014': 19,
    '10394827': 20
  };
  return numericMap[normalized] || null;
};

interface Participant {
  id: string;
  app_id?: string;
  full_name: string;
  college_name: string;
  registration_id: string;
  instagram_id?: string;
}

interface PeerTarget {
  name: string;
  found: boolean;
}

interface Progress {
  completed_quizzes: number;
  total_score: number;
  total_time: number;
  next_barrel_id: number | null;
  current_attempt_id: string | null;
  peer_targets?: PeerTarget[];
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

  // Peer hunt states
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [instagramInput, setInstagramInput] = useState('');
  const [peerVerifyError, setPeerVerifyError] = useState<string | null>(null);
  const [peerVerifySuccess, setPeerVerifySuccess] = useState<string | null>(null);
  const [peerSubmitting, setPeerSubmitting] = useState(false);

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
      if (bId >= 1 && bId <= 20) {
        setIsScannerOpen(false);
        resetScannerState();
        router.push(`/barrel/${bId}?code=${BARREL_CODES[bId]}`);
        return;
      }
    }

    // Try parsing raw number (e.g. 3)
    const rawNum = parseInt(decodedText.trim(), 10);
    if (!isNaN(rawNum) && rawNum >= 1 && rawNum <= 20) {
      setIsScannerOpen(false);
      resetScannerState();
      router.push(`/barrel/${rawNum}?code=${BARREL_CODES[rawNum]}`);
      return;
    }

    // Try parsing 8 digit code
    const detectedBId = getBarrelIdFromCode(decodedText);
    if (detectedBId) {
      setIsScannerOpen(false);
      resetScannerState();
      router.push(`/barrel/${detectedBId}?code=${decodedText}`);
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
      router.push(`/barrel/${detectedBId}?code=${code}`);
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
        } else {
          setParticipant(null);
          setProgress(null);
        }
      } else {
        setParticipant(null);
        setProgress(null);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setParticipant(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const handleRefresh = () => fetchSession();
    window.addEventListener('refresh-session', handleRefresh);
    return () => {
      window.removeEventListener('refresh-session', handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('scan') === 'true') {
        setIsScannerOpen(true);
        // Clear the search param from URL so it doesn't trigger on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    const handleOpenScanner = () => setIsScannerOpen(true);
    window.addEventListener('open-scanner', handleOpenScanner);
    return () => {
      window.removeEventListener('open-scanner', handleOpenScanner);
    };
  }, [loading]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerifyPeer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer || !instagramInput.trim()) return;

    setPeerSubmitting(true);
    setPeerVerifyError(null);
    setPeerVerifySuccess(null);

    try {
      const res = await fetch('/api/peer-hunt/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedPeer,
          instagramId: instagramInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPeerVerifyError(data.error || 'Verification failed. Try again.');
      } else {
        setPeerVerifySuccess(data.message || 'Peer verified! +25 XP awarded.');
        if (progress) {
          setProgress({
            ...progress,
            total_score: data.newScore,
            peer_targets: data.peer_targets
          });
        }
        setInstagramInput('');
        setTimeout(() => {
          setSelectedPeer(null);
          setPeerVerifySuccess(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Peer verification error:', err);
      setPeerVerifyError('Connection error. Verify your network status.');
    } finally {
      setPeerSubmitting(false);
    }
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
              <span className="font-mono text-xs font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block mr-2">
                PARTICIPANT STATUS
              </span>
              {participant.app_id && (
                <span className="font-mono text-xs font-bold bg-brand-secondary text-brand-on-secondary px-3 py-1 mb-2 inline-block">
                  APP ID: {participant.app_id}
                </span>
              )}
              <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface tracking-tight mt-1">
                WELCOME BACK, <br />
                <span className="text-brand-primary">{participant.full_name}</span>
              </h2>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-brand-surface border-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] p-6 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
                  INSTAGRAM HANDLE
                </span>
                <span className="font-display text-2xl font-black text-brand-primary mt-2">
                  @{participant.instagram_id ? participant.instagram_id.replace(/^@+/, '') : 'not_set'}
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
            {progress.completed_quizzes < 20 && progress.next_barrel_id ? (
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
                        {progress.completed_quizzes} / 20
                      </span>
                    </div>

                    {/* Step-block progress bar */}
                    <div className="flex gap-1 h-8">
                      {Array.from({ length: 20 }).map((_, i) => {
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
                        <span>Points contribute to your Zone and individual scoreboard standing.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-brand-primary">!</span>
                        <span>Wrong barrels scanned out of sequence will trigger automatic security audit logs.</span>
                      </div>
                    </div>
                  </div>

                  {/* Footnote block */}
                  <div className="p-4 bg-brand-surface-container border-t-2 border-brand-on-surface font-mono text-[10px] text-center text-brand-on-surface-variant">
                    68th YEAR ANNUAL NASA HERITAGE HUNT • WOXSEN UNIVERSITY
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
                  Outstanding performance, <strong className="text-brand-primary uppercase">{participant.full_name}</strong>! You successfully located and scanned all 20 heritage barrels on campus.
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


            {/* ------------------------------------------------------------- */}
            {/* NETWORKING QUEST: FIND YOUR PEERS (250 XP POTENTIAL) */}
            {/* ------------------------------------------------------------- */}
            {progress.peer_targets && progress.peer_targets.length > 0 && (
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col justify-between">
                {/* Header */}
                <div className="bg-brand-mustard p-4 border-b-4 border-brand-on-surface flex justify-between items-center text-brand-on-surface">
                  <h3 className="font-mono text-xs font-bold tracking-widest flex items-center gap-2 uppercase">
                    <span className="inline-block w-2.5 h-2.5 bg-brand-primary border border-brand-on-surface animate-ping" />
                    INSTAGRAM HUNT • NETWORKING MODULE
                  </h3>
                  <span className="font-mono text-xs font-bold bg-brand-on-surface text-brand-surface px-2 py-0.5 border border-brand-on-surface">
                    +25 XP EACH
                  </span>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-black text-brand-on-surface uppercase leading-none">
                      Find Peers & Validate Instagram IDs
                    </h2>
                    <p className="font-sans text-brand-on-surface-variant text-sm mt-2 leading-relaxed">
                      Randomly assigned peers are currently roaming the campus. Locate them, strike a conversation, learn their <strong className="text-brand-secondary">Instagram ID</strong>, and submit it below to unlock bonus XP!
                    </p>
                  </div>

                  {/* Targets grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {progress.peer_targets.map((peer) => (
                      <div 
                        key={peer.name}
                        className={`p-4 border-2 border-brand-on-surface flex flex-col justify-between items-stretch text-center transition duration-200 ${
                          peer.found 
                            ? 'bg-brand-surface-low border-dashed opacity-75' 
                            : 'bg-brand-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:shadow-[5px_5px_0px_0px_rgba(28,27,27,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2 border-b border-brand-outline-variant pb-1">
                          {peer.found ? '✓ VERIFIED' : '✖ SEEKING'}
                        </div>
                        
                        <div className="font-display font-black text-xs text-brand-on-surface uppercase truncate mb-3" title={peer.name}>
                          {peer.name}
                        </div>

                        {peer.found ? (
                          <div className="py-1 bg-brand-secondary text-brand-on-secondary text-[10px] font-mono font-bold uppercase border border-brand-on-surface">
                            +25 XP SECURED
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedPeer(peer.name);
                              setInstagramInput('');
                              setPeerVerifyError(null);
                              setPeerVerifySuccess(null);
                            }}
                            className="w-full py-1.5 bg-brand-secondary text-brand-on-secondary border border-brand-on-surface text-[10px] font-display font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-secondary/95 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all cursor-pointer"
                          >
                            Verify Instagram
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Verification pop-up modal inside dashboard */}
                  {selectedPeer && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-brand-surface max-w-md w-full border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 relative">
                        <button 
                          onClick={() => setSelectedPeer(null)}
                          className="absolute -top-3 -right-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface p-2 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                          title="Close Modal"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="mb-4">
                          <span className="font-mono text-[9px] font-bold bg-brand-secondary text-brand-on-secondary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
                            PEER VERIFICATION
                          </span>
                          <h4 className="font-display text-xl font-black uppercase text-brand-on-surface tracking-wider">
                            VERIFY {selectedPeer}
                          </h4>
                          <p className="text-xs text-brand-on-surface-variant mt-1.5 leading-relaxed">
                            Enter the exact Instagram handle of this participant to unlock +25 XP.
                          </p>
                        </div>

                        {peerVerifyError && (
                          <div className="mb-4 p-3 bg-red-50 border-2 border-brand-error text-brand-error font-mono text-[10px] font-bold uppercase">
                            ERROR: {peerVerifyError}
                          </div>
                        )}

                        {peerVerifySuccess && (
                          <div className="mb-4 p-3 bg-brand-secondary-container border-2 border-brand-secondary text-brand-on-secondary font-mono text-[10px] font-bold uppercase">
                            SUCCESS: {peerVerifySuccess}
                          </div>
                        )}

                        <form onSubmit={handleVerifyPeer} className="space-y-4">
                          <div className="flex border-2 border-brand-on-surface focus-within:border-brand-secondary transition-all bg-brand-surface">
                            <span className="flex items-center justify-center px-4 bg-brand-surface-container text-brand-on-surface border-r-2 border-brand-on-surface font-mono font-bold text-xs select-none">
                              @
                            </span>
                            <input
                              type="text"
                              value={instagramInput}
                              onChange={(e) => {
                                setInstagramInput(e.target.value);
                                setPeerVerifyError(null);
                              }}
                              placeholder="username"
                              maxLength={50}
                              disabled={peerSubmitting}
                              className="flex-grow px-4 py-3 text-xs bg-transparent text-brand-on-surface placeholder:text-brand-outline-variant placeholder:opacity-50 outline-none border-none font-mono font-bold animate-none"
                              required
                              autoFocus
                            />
                          </div>

                          <div className="flex gap-4 pt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPeer(null)}
                              disabled={peerSubmitting}
                              className="flex-1 py-3 bg-brand-surface border-2 border-brand-on-surface text-brand-on-surface font-mono font-bold text-xs uppercase hover:bg-brand-surface-low transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={peerSubmitting}
                              className="flex-1 py-3 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider hover:bg-brand-secondary/95 transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                            >
                              {peerSubmitting ? 'VALIDATING...' : 'SUBMIT'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
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
                  68th Year <br />
                  Annual Nasa <br />
                  Heritage Hunt
                </h1>
                <p className="font-sans text-brand-surface-highest text-sm sm:text-base max-w-xl leading-relaxed">
                  Embark on an immersive, campus-wide treasure hunt. Decode architectural clues, scan physical barrel nodes, and solve structural design quizzes to win!
                </p>
              </div>

              <div className="md:col-span-4 grid grid-rows-2 gap-6">
                <div className="bg-brand-secondary p-6 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center text-center text-brand-on-secondary">
                  <Compass className="h-16 w-16 text-brand-secondary-container mb-2 animate-spin-slow" />
                  <h3 className="font-display text-lg font-black uppercase tracking-wider">The Challenge</h3>
                </div>
                <div className="bg-brand-mustard p-6 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center text-center text-brand-on-surface">
                  <h2 className="font-display text-5xl font-black mb-0">20</h2>
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

          </div>
        )}
      </main>

      {/* Footer Sponsor Strips */}
      <footer className="bg-brand-surface-highest border-t-4 border-brand-on-surface py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col md:flex-row justify-center items-stretch md:items-center gap-8 md:gap-16 w-full max-w-4xl">
            {/* Hosted By Card */}
            <a
              href="https://woxsen.edu.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center bg-brand-surface border-2 border-brand-on-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-w-[200px] justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <span className="font-mono text-[9px] text-brand-on-surface-variant mb-2 uppercase tracking-wider font-bold">HOSTED BY</span>
              <div className="h-10 flex items-center justify-center">
                <img src="/woxsen-logo.png" alt="Woxsen University" className="h-8 md:h-10 object-contain" />
              </div>
              <span className="font-display font-bold text-[10px] uppercase text-brand-outline mt-2 tracking-wider">Woxsen University</span>
            </a>
            
            {/* Powered By Card */}
            <a
              href="https://www.nasaindia.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center bg-brand-surface border-2 border-brand-on-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-w-[200px] justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <span className="font-mono text-[9px] text-brand-on-surface-variant mb-2 uppercase tracking-wider font-bold">POWERED BY</span>
              <div className="h-10 flex items-center justify-center">
                <img src="/catalyse-logo.png" alt="Catalyse" className="h-8 md:h-10 object-contain" />
              </div>
              <span className="font-display font-bold text-[10px] uppercase text-brand-outline mt-2 tracking-wider">Catalyse</span>
            </a>

            {/* Organized By Card */}
            <a
              href="https://www.nasaindia.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center bg-brand-surface border-2 border-brand-on-surface p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-w-[200px] justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <span className="font-mono text-[9px] text-brand-on-surface-variant mb-2 uppercase tracking-wider font-bold">ORGANIZED BY</span>
              <div className="h-10 flex items-center justify-center">
                <img src="/nasa-logo.png" alt="NASA India" className="h-8 md:h-10 object-contain" />
              </div>
              <span className="font-display font-bold text-[10px] uppercase text-brand-outline mt-2 tracking-wider">NASA India</span>
            </a>
          </div>
          
          <div className="flex gap-6 mt-6">
            <a href="https://www.nasaindia.co/" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">NASA India</a>
            <span className="text-brand-outline-variant">•</span>
            <a href="https://www.nasaindia.co/" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">Catalyse</a>
            <span className="text-brand-outline-variant">•</span>
            <a href="https://www.nasaindia.co/" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-brand-on-surface-variant hover:text-brand-secondary font-bold uppercase">Support</a>
          </div>

          <p className="font-mono text-[10px] text-brand-on-surface-variant mt-4 font-bold">
            68th Year Annual Nasa Heritage Hunt x Woxsen University © 2026
          </p>

          <div className="flex flex-col items-center gap-1.5 mt-4">
            <p className="font-mono text-[10px] text-brand-on-surface-variant">
              Made with ❤️ by <a href="https://varadpatil.in/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary font-bold">Varad Patil</a>
            </p>
            <div className="flex gap-3">
              <a href="https://varadpatil.in/" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-primary font-bold underline">Website</a>
              <span className="text-brand-outline-variant text-[9px]">•</span>
              <a href="https://www.linkedin.com/in/varadpatil665/" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-primary font-bold underline">LinkedIn</a>
              <span className="text-brand-outline-variant text-[9px]">•</span>
              <a href="https://github.com/varadrz" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-primary font-bold underline">GitHub</a>
            </div>
          </div>
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
                      placeholder="8-DIGIT CODE"
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
