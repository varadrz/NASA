'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, Compass, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

interface ParticipantSession {
  id: string;
  full_name: string;
  college_name: string;
  registration_id: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { name: 'Hunt Node', href: '/', icon: LayoutDashboard },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-surface border-b-4 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display font-black text-lg md:text-xl tracking-tighter uppercase text-brand-on-surface">
                68th NASA CONVENTION
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
                  className={`flex items-center gap-2 px-3 py-1.5 border-2 text-xs uppercase font-mono font-bold tracking-wider transition ${
                    isActive
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
              <Compass className="h-3.5 w-3.5" />
              Campus Map
            </Link>
          </div>

          {/* Participant status display */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && participant ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-display font-black uppercase text-brand-on-surface">{participant.full_name}</div>
                  <div className="text-[10px] font-mono font-bold text-brand-primary flex gap-2 justify-end">
                    <span>{progress?.total_score || 0} XP</span>
                    <span>•</span>
                    <span>{progress?.completed_quizzes || 0}/10 BARRELS</span>
                  </div>
                </div>
                
                {/* Square block avatar - Bauhaus style */}
                <div className="h-9 w-9 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-bold text-sm shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                  {getInitials(participant.full_name)}
                </div>

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
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all"
                >
                  Register
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && participant && (
              <div className="h-8 w-8 bg-brand-primary text-brand-on-primary border border-brand-on-surface flex items-center justify-center font-display font-black text-xs">
                {getInitials(participant.full_name)}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-transparent hover:border-brand-on-surface text-brand-on-surface focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-brand-on-surface bg-brand-surface px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 border border-transparent font-display font-bold text-sm uppercase ${
                  isActive
                    ? 'bg-brand-secondary text-brand-on-secondary border-brand-on-surface'
                    : 'text-brand-on-surface-variant hover:border-brand-on-surface'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-3 border border-transparent font-display font-bold text-sm uppercase text-brand-on-surface-variant hover:border-brand-on-surface text-left"
          >
            <Compass className="h-4 w-4" />
            Campus Map
          </Link>

          {!loading && participant ? (
            <div className="pt-4 pb-2 border-t border-brand-on-surface px-3">
              <div className="mb-3">
                <div className="text-sm font-display font-black uppercase text-brand-on-surface">{participant.full_name}</div>
                <div className="text-xs text-brand-on-surface-variant font-mono">{participant.college_name}</div>
                <div className="mt-1 text-xs font-mono font-bold text-brand-primary uppercase">
                  SCORE: {progress?.total_score || 0} XP | BARRELS: {progress?.completed_quizzes || 0}/10
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 bg-brand-surface border-2 border-brand-on-surface text-brand-primary text-xs font-mono font-bold uppercase hover:bg-brand-primary/5 transition flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout Session
              </button>
            </div>
          ) : (
            !loading && (
              <div className="pt-4 border-t border-brand-on-surface px-3">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(28,27,27,1)]"
                >
                  Register / Join Hunt
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
