'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, Compass, LayoutDashboard, LogOut, QrCode, User, Shield, X, Calendar } from 'lucide-react';

interface ParticipantSession {
  id: string;
  full_name: string;
  college_name: string;
  phone_number?: string;
  registration_id: string;
  instagram_id?: string;
  has_edited_details?: boolean;
}

interface ProgressSession {
  completed_quizzes: number;
  total_score: number;
  total_time: number;
  next_barrel_id: number | null;
  current_attempt_id: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [participant, setParticipant] = useState<ParticipantSession | null>(null);
  const [progress, setProgress] = useState<ProgressSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    college_name: '',
    phone_number: '',
    instagram_id: ''
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleOpenEdit = () => {
    if (participant) {
      setEditForm({
        full_name: participant.full_name || '',
        college_name: participant.college_name || '',
        phone_number: participant.phone_number || '',
        instagram_id: participant.instagram_id ? participant.instagram_id.replace(/^@+/, '') : ''
      });
      setEditError(null);
      setEditModalOpen(true);
      setProfileOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError(null);

    if (!editForm.full_name.trim() || !editForm.college_name.trim() || !editForm.phone_number.trim() || !editForm.instagram_id.trim()) {
      setEditError('All fields are required.');
      setEditSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update profile details.');
        setEditSubmitting(false);
        return;
      }

      setEditModalOpen(false);
      fetchSession();
      window.dispatchEvent(new Event('refresh-session'));
      router.refresh();
    } catch (err) {
      console.error('Edit details submission error:', err);
      setEditError('Connection error. Please try again.');
      setEditSubmitting(false);
    }
  };

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
      console.error('Navbar session check error:', err);
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
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/session', { method: 'DELETE' });
      if (res.ok) {
        setParticipant(null);
        setProgress(null);
        window.dispatchEvent(new Event('refresh-session'));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleScanClick = () => {
    setProfileOpen(false);
    if (pathname === '/') {
      window.dispatchEvent(new Event('open-scanner'));
    } else {
      router.push('/?scan=true');
    }
  };

  const navLinks = [
    { name: 'Hunt Node', href: '/', icon: LayoutDashboard },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award },
  ];

  return (
    <>
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-40 bg-brand-surface border-b-4 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <img 
                  src="/nasa-logo.png" 
                  alt="NASA Logo" 
                  className="h-14 w-auto object-contain border border-brand-on-surface p-0.5 bg-white shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]" 
                />
                <span className="font-display font-black text-lg md:text-xl tracking-tighter uppercase text-brand-on-surface">
                  68th Year Annual Nasa Heritage Hunt
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 border-2 text-xs uppercase font-mono font-bold tracking-wider transition ${isActive
                      ? 'bg-brand-secondary text-brand-on-secondary border-brand-on-surface'
                      : 'text-brand-on-surface-variant border-transparent hover:border-brand-on-surface hover:text-brand-on-surface'
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                );
              })}
              <Link
                href="/map"
                className="flex items-center gap-2 px-3 py-1.5 border-2 text-xs uppercase font-mono font-bold tracking-wider transition text-brand-on-surface-variant border-transparent hover:border-brand-on-surface hover:text-brand-on-surface"
              >
                <Calendar className="h-3.5 w-3.5" />
                Schedule
              </Link>
            </div>

            {/* Desktop Participant status display */}
            <div className="hidden md:flex items-center gap-4">
              {!loading && participant ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-display font-black uppercase text-brand-on-surface">{participant.full_name}</div>
                    <div className="text-[10px] font-mono font-bold text-brand-primary flex gap-2 justify-end">
                      <span>{progress?.total_score || 0} XP</span>
                      <span>•</span>
                      <span>{progress?.completed_quizzes || 0}/20 BARRELS</span>
                    </div>
                  </div>

                  {/* Square block avatar - Bauhaus style */}
                  <div className="h-9 w-9 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-bold text-sm shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                    {getInitials(participant.full_name)}
                  </div>

                  {participant.registration_id.toLowerCase().startsWith('admin') && (
                    <Link
                      href="/admin"
                      className="p-2 border-2 border-transparent hover:border-brand-on-surface text-brand-outline hover:text-brand-primary transition"
                      title="Admin Panel"
                    >
                      <Shield className="h-4 w-4" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-2 border-2 border-transparent hover:border-brand-on-surface text-brand-outline hover:text-brand-primary transition"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider bg-brand-surface text-brand-on-surface border-2 border-brand-on-surface hover:bg-brand-surface-low transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Mobile Top Right Avatar (Click opens Profile Bottom Sheet) */}
            <div className="md:hidden flex items-center">
              {!loading && participant ? (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="h-8 w-8 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-bold text-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
                >
                  {getInitials(participant.full_name)}
                </button>
              ) : (
                !loading && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    JOIN
                  </Link>
                )
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar (App-style layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface border-t-4 border-brand-on-surface h-16 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">

        {/* Tab 1: Home / Hunt */}
        <Link
          href="/"
          onClick={() => setProfileOpen(false)}
          className={`flex flex-col items-center justify-center w-12 h-12 transition ${pathname === '/' && !profileOpen
            ? 'text-brand-primary scale-105'
            : 'text-brand-on-surface-variant opacity-80'
            }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-tighter mt-0.5">Hunt</span>
        </Link>

        {/* Tab 2: Leaderboard */}
        <Link
          href="/leaderboard"
          onClick={() => setProfileOpen(false)}
          className={`flex flex-col items-center justify-center w-12 h-12 transition ${pathname === '/leaderboard' && !profileOpen
            ? 'text-brand-primary scale-105'
            : 'text-brand-on-surface-variant opacity-80'
            }`}
        >
          <Award className="h-5 w-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-tighter mt-0.5">Leaderboard</span>
        </Link>

        {/* Tab 3: Centered QR Scan Trigger Button */}
        <button
          onClick={handleScanClick}
          className="relative -top-3 h-14 w-14 bg-brand-mustard text-brand-on-surface border-2 border-brand-on-surface rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-y-[-9px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all cursor-pointer"
          title="Scan QR Code"
        >
          <QrCode className="h-6 w-6 font-bold" />
        </button>

        {/* Tab 4: Schedule */}
        <Link
          href="/map"
          onClick={() => setProfileOpen(false)}
          className={`flex flex-col items-center justify-center w-12 h-12 transition ${pathname === '/map' && !profileOpen
            ? 'text-brand-primary scale-105'
            : 'text-brand-on-surface-variant opacity-80'
            }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-tighter mt-0.5">Schedule</span>
        </Link>

        {/* Tab 5: Profile Sheet Trigger */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`flex flex-col items-center justify-center w-12 h-12 transition ${profileOpen
            ? 'text-brand-primary scale-105'
            : 'text-brand-on-surface-variant opacity-80'
            }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-tighter mt-0.5">Profile</span>
        </button>

      </div>

      {/* Mobile Bottom Sheet Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center">
          {/* Dark Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-300"
            onClick={() => setProfileOpen(false)}
          />

          {/* Bottom Sheet Container */}
          <div className="relative w-full bg-brand-surface border-t-4 border-brand-on-surface p-6 pb-12 space-y-6 rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.2)] animate-slide-up">

            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="font-display font-black text-sm uppercase text-brand-on-surface">Participant Profile</span>
              <button
                onClick={() => setProfileOpen(false)}
                className="p-1.5 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface hover:bg-brand-surface-low transition active:translate-y-[1px] font-bold text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!loading && participant ? (
              <div className="space-y-6">
                {/* Details Card */}
                <div className="bg-brand-surface border-4 border-brand-on-surface p-4 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] flex items-center gap-4">
                  <div className="h-12 w-12 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-base shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                    {getInitials(participant.full_name)}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base uppercase text-brand-on-surface leading-tight">{participant.full_name}</h3>
                    <p className="font-mono text-xs text-brand-on-surface-variant uppercase">{participant.college_name}</p>
                    <p className="font-mono text-[10px] text-brand-outline-variant uppercase">Instagram: @{participant.instagram_id ? participant.instagram_id.replace(/^@/, '') : 'not_set'}</p>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-surface border-2 border-brand-on-surface p-3 text-center shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                    <p className="font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Score</p>
                    <p className="font-display font-black text-lg text-brand-primary">{progress?.total_score || 0} XP</p>
                  </div>
                  <div className="bg-brand-surface border-2 border-brand-on-surface p-3 text-center shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                    <p className="font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Barrels Scanned</p>
                    <p className="font-display font-black text-lg text-brand-secondary">{progress?.completed_quizzes || 0}/20</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  {participant.registration_id.toLowerCase().startsWith('admin') && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="w-full py-3 bg-brand-mustard border-2 border-brand-on-surface text-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  {!participant.has_edited_details && (
                    <button
                      onClick={handleOpenEdit}
                      className="w-full py-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider hover:bg-brand-primary-container transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <User className="h-4 w-4" />
                      Edit Details (Once)
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 bg-brand-surface border-2 border-brand-on-surface text-brand-primary font-mono font-bold text-xs uppercase hover:bg-brand-primary/5 transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <p className="text-sm font-sans font-bold text-brand-on-surface-variant uppercase">You are currently playing as a Guest</p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setProfileOpen(false)}
                    className="w-full py-3 bg-brand-surface text-brand-on-surface border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-xs uppercase tracking-wider hover:bg-brand-surface-low shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setProfileOpen(false)}
                    className="w-full py-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    Register / Join Hunt
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE DETAILS MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface max-w-md w-full border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute -top-3 -right-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface p-2 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              title="Close Modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6">
              <span className="font-mono text-[9px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
                Account Details Update
              </span>
              <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">
                EDIT DETAILS
              </h2>
            </div>

            {/* Sizing/Details warning */}
            <div className="p-2.5 border-2 border-brand-on-surface bg-brand-mustard text-brand-on-surface font-mono text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] text-center whitespace-nowrap overflow-x-auto scrollbar-none mb-6">
              DETAILS CAN ONLY BE EDITED ONCE. DOUBLE-CHECK CAREFULLY.
            </div>

            {editError && (
              <div className="mb-4 p-3 border-2 border-brand-error bg-red-50 text-brand-error font-mono text-xs font-bold uppercase">
                ERROR: {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="font-mono text-xs font-bold block mb-1 text-brand-on-surface-variant uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  disabled={editSubmitting}
                  className="w-full input-brutalist px-3 py-2 text-xs uppercase"
                  required
                />
              </div>

              {/* Zone No */}
              <div>
                <label className="font-mono text-xs font-bold block mb-1 text-brand-on-surface-variant uppercase tracking-wider">
                  Zone No.
                </label>
                <select
                  value={editForm.college_name}
                  onChange={(e) => setEditForm({ ...editForm, college_name: e.target.value })}
                  disabled={editSubmitting}
                  className="w-full input-brutalist px-3 py-2 text-xs uppercase bg-brand-surface font-bold"
                  required
                >
                  <option value="" disabled>SELECT YOUR ZONE</option>
                  <option value="Zone 1">ZONE 1</option>
                  <option value="Zone 2">ZONE 2</option>
                  <option value="Zone 3">ZONE 3</option>
                  <option value="Zone 4">ZONE 4</option>
                  <option value="Zone 5">ZONE 5</option>
                  <option value="Zone 6">ZONE 6</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="font-mono text-xs font-bold block mb-1 text-brand-on-surface-variant uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  disabled={editSubmitting}
                  className="w-full input-brutalist px-3 py-2 text-xs uppercase"
                  required
                />
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="font-mono text-xs font-bold block mb-1 text-brand-on-surface-variant uppercase tracking-wider">
                  Instagram Handle
                </label>
                <div className="flex border-2 border-brand-on-surface focus-within:border-brand-secondary focus-within:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all bg-brand-surface">
                  <span className="flex items-center justify-center px-3 bg-brand-surface-container text-brand-on-surface border-r-2 border-brand-on-surface font-mono font-bold text-xs select-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={editForm.instagram_id}
                    onChange={(e) => setEditForm({ ...editForm, instagram_id: e.target.value })}
                    disabled={editSubmitting}
                    className="flex-grow px-3 py-2 text-xs bg-transparent text-brand-on-surface outline-none border-none"
                    required
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editSubmitting}
                  className="flex-1 py-3 bg-brand-surface border-2 border-brand-on-surface text-brand-on-surface font-mono font-bold text-xs uppercase hover:bg-brand-surface-low transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-3 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider hover:bg-brand-secondary/90 transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
