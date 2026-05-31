// Administrative Dashboard Panel (Bauhaus Theme)
// Location: src/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  BarChart3, 
  Database, 
  FileSpreadsheet, 
  History, 
  Lock, 
  Printer, 
  QrCode, 
  RefreshCw, 
  Trash2, 
  UserMinus, 
  UserPlus, 
  Users, 
  CheckCircle2,
  Compass,
  Trophy,
  Clock
} from 'lucide-react';

const BARREL_CODES: { [key: number]: { alpha: string; numeric: string } } = {
  1: { alpha: 'NASA0801', numeric: '48392015' },
  2: { alpha: 'NASA0802', numeric: '89201543' },
  3: { alpha: 'NASA0803', numeric: '31548920' },
  4: { alpha: 'NASA0804', numeric: '54389201' },
  5: { alpha: 'NASA0805', numeric: '92015438' },
  6: { alpha: 'NASA0806', numeric: '15438920' },
  7: { alpha: 'NASA0807', numeric: '83920154' },
  8: { alpha: 'NASA0808', numeric: '43892015' },
  9: { alpha: 'NASA0809', numeric: '20154389' },
  10: { alpha: 'NASA0810', numeric: '71543892' }
};

interface StatsSummary {
  total_participants: number;
  active_participants: number;
  disabled_participants: number;
  completed_all_10: number;
  average_score: number;
  average_time_seconds: number;
}

interface QuizStat {
  barrel_id: number;
  title: string;
  completions: number;
  average_score: number;
  average_time_seconds: number;
}

interface ParticipantEnriched {
  id: string;
  full_name: string;
  college_name: string;
  phone_number: string;
  registration_id: string;
  is_disabled: boolean;
  created_at: string;
  completed_quizzes: number;
  total_score: number;
  total_time: number;
}

interface AuditLog {
  id: string;
  participant_id: string | null;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  full_name: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'stats' | 'participants' | 'qrcodes' | 'database' | 'audits'>('stats');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [completionDist, setCompletionDist] = useState<any[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStat[]>([]);
  const [participants, setParticipants] = useState<ParticipantEnriched[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [originUrl, setOriginUrl] = useState('');

  // Confirmation states
  const [wiping, setWiping] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const router = useRouter();

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_pw');
    setIsAuthenticated(false);
    setPassword('');
    document.cookie = "admin_session=; path=/; max-age=0";
    router.refresh();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setVerifying(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_pw', password);
        fetchDashboardData(password);
      } else {
        setLoginError(data.error || 'Invalid administrative password.');
      }
    } catch (err) {
      setLoginError('Connection failure evaluating security key.');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw');
    if (saved) {
      setPassword(saved);
      setIsAuthenticated(true);
      fetchDashboardData(saved);
    }
  }, []);

  const fetchDashboardData = async (pw = password, showIndicator = false) => {
    if (!pw) return;
    if (showIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const statsRes = await fetch('/api/admin/stats', { headers: { 'x-admin-password': pw } });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setSummary(data.summary);
        setCompletionDist(data.completion_distribution);
        setQuizStats(data.quizzes);
      }

      const partRes = await fetch('/api/admin/participants', { headers: { 'x-admin-password': pw } });
      if (partRes.ok) {
        const data = await partRes.json();
        setParticipants(data.participants || []);
      }

      const auditRes = await fetch('/api/admin/audit-logs', { headers: { 'x-admin-password': pw } });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (id: string, currentlyDisabled: boolean) => {
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ id, isDisabled: !currentlyDisabled })
      });
      if (res.ok) {
        fetchDashboardData(password, true);
      }
    } catch (err) {
      alert('Error updating participant status.');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('Permanently delete participant? Attempt logs and rankings will be wiped!')) return;
    try {
      const res = await fetch(`/api/admin/participants?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        fetchDashboardData(password, true);
      }
    } catch (err) {
      alert('Error deleting participant.');
    }
  };

  const handleResetEvent = async () => {
    const doubleCheck = prompt('WARNING: This wipes all registered participants, attempts, logs, and score boards! Type "WIPE EVENT" to confirm:');
    if (doubleCheck !== 'WIPE EVENT') {
      alert('Wipe operation cancelled.');
      return;
    }

    setWiping(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      alert(data.message || 'Wiped successfully!');
      fetchDashboardData(password);
    } catch (err) {
      alert('Reset failed.');
    } finally {
      setWiping(false);
    }
  };

  const handleSeedQuestions = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-questions', {
        method: 'POST',
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      alert(data.message || 'Seeded successfully!');
      fetchDashboardData(password);
    } catch (err) {
      alert('Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  const handleExportCSV = () => {
    const link = document.createElement('a');
    link.href = `/api/admin/export-csv`;
    document.cookie = `admin_session=${encodeURIComponent(password)}; path=/; max-age=60`;
    link.click();
  };

  const printQRCodes = () => {
    window.print();
  };

  const filteredParticipants = participants.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.registration_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // RENDER ADMIN LOGIN GATE
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-surface text-brand-on-surface">
        <AdminNavbar isAuthenticated={false} />
        <div className="flex-1 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="bg-brand-surface p-8 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 bg-brand-mustard border-2 border-brand-on-surface text-brand-on-surface mb-2">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-black uppercase text-brand-on-surface">ADMIN SECURITY GATE</h2>
              <p className="font-sans text-brand-on-surface-variant text-xs leading-relaxed">
                Provide administrative credentials to configure physical seeds, ban participants, and export scores.
              </p>
            </div>

            {loginError && (
              <div className="p-3 border-2 border-brand-error bg-red-50 text-brand-error font-mono text-xs font-bold uppercase">
                ERROR: {loginError}
              </div>
            )}

            <div>
              <label htmlFor="admin_pw" className="block font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2">
                Administrative Password
              </label>
              <input
                type="password"
                id="admin_pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER ADMINISTRATIVE CODE"
                disabled={verifying}
                className="w-full input-brutalist px-4 py-3 text-xs font-mono uppercase"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-4 bg-brand-primary text-brand-on-primary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Compass className="h-4.5 w-4.5 animate-spin" />
                  AUTHENTICATING SECURITY ENVELOPE...
                </>
              ) : (
                'ACCESS COMMAND STATION'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER DOCK MANAGEMENT STATION
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface print:bg-white print:text-black">
      <div className="print:hidden">
        <AdminNavbar isAuthenticated={true} onLogout={handleAdminLogout} />
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 space-y-8 print:py-0 print:px-0 pb-32">
        
        {/* Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-brand-on-surface pb-6 print:hidden">
          <div>
            <span className="font-mono text-[10px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              ADMIN CONTROL
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface flex items-center gap-2 tracking-tight">
              <Database className="h-8 w-8 text-brand-mustard" />
              Administrative Command Center
            </h1>
            <p className="text-brand-on-surface-variant text-sm mt-2">
              Configure question pools, audit rate-limit bypass logs, suspend participants, and export CSV sheets.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fetchDashboardData(password, true)}
              disabled={refreshing}
              className="px-5 py-3 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${refreshing ? 'animate-spin' : ''}`} />
              SYNC DATA
            </button>

            <button
              onClick={handleExportCSV}
              className="px-5 py-3 border-2 border-brand-on-surface bg-brand-secondary text-brand-on-secondary font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              EXPORT CSV REPORT
            </button>
          </div>
        </div>

        {/* Console Navigation Tab Controls */}
        <div className="flex overflow-x-auto gap-2 border-b-2 border-brand-on-surface pb-4 scrollbar-none whitespace-nowrap print:hidden">
          {[
            { id: 'stats', label: 'Overview Analytics', icon: BarChart3 },
            { id: 'participants', label: 'Participant Roster', icon: Users },
            { id: 'qrcodes', label: 'Barrel QR Codes', icon: QrCode },
            { id: 'database', label: 'System Controls', icon: Database },
            { id: 'audits', label: 'Security Audits', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 border-2 font-display text-xs uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-brand-mustard text-brand-on-surface border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] translate-x-[1px] translate-y-[1px]'
                    : 'bg-brand-surface border-transparent text-brand-on-surface-variant hover:border-brand-on-surface'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-24 text-center text-brand-on-surface-variant font-mono flex flex-col items-center justify-center print:hidden">
            <Compass className="h-12 w-12 text-brand-primary animate-spin mb-4" />
            <span className="text-xs font-bold uppercase tracking-widest">SYNCING DATA CHANNELS...</span>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW ANALYTICS TAB */}
            {/* 1. OVERVIEW ANALYTICS TAB */}
            {activeTab === 'stats' && summary && (() => {
              const activeQuizStats = quizStats.filter(q => q.completions > 0);
              const hardestQuiz = activeQuizStats.length > 0 
                ? [...activeQuizStats].sort((a, b) => a.average_score - b.average_score)[0]
                : null;
              const longestQuiz = activeQuizStats.length > 0 
                ? [...activeQuizStats].sort((a, b) => b.average_time_seconds - a.average_time_seconds)[0]
                : null;
              const mostPopularQuiz = activeQuizStats.length > 0
                ? [...activeQuizStats].sort((a, b) => b.completions - a.completions)[0]
                : null;
              const maxCompletions = Math.max(...quizStats.map(q => q.completions), 1);

              return (
                <div className="space-y-8 animate-fade-in print:hidden">
                  {/* Metric Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Registered', val: summary.total_participants, icon: Users, color: 'bg-brand-surface border-brand-on-surface text-brand-on-surface' },
                      { label: 'Completed All 10', val: summary.completed_all_10, icon: Trophy, color: 'bg-brand-mustard border-brand-on-surface text-brand-on-surface' },
                      { label: 'Average Score', val: `${summary.average_score} / 500`, icon: CheckCircle2, color: 'bg-brand-secondary border-brand-on-surface text-brand-on-secondary' },
                      { label: 'Avg Hunt Duration', val: `${Math.floor(summary.average_time_seconds / 60)}m ${summary.average_time_seconds % 60}s`, icon: Clock, color: 'bg-brand-primary border-brand-on-surface text-brand-on-primary' }
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className={`p-6 border-2 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] flex items-center gap-4 ${card.color}`}>
                          <div className="p-3 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="font-mono text-[9px] block font-bold uppercase tracking-widest opacity-80">{card.label}</span>
                            <strong className="font-display text-2xl font-black mt-1 block">{card.val}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub-table: Quiz Completion Statistics */}
                  <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)]">
                    <div className="bg-brand-on-surface p-4 border-b-2 border-brand-on-surface text-brand-surface font-display font-black text-sm uppercase tracking-wider">
                      INDIVIDUAL BARREL ANALYTICS
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-brand-surface border-b-2 border-brand-on-surface text-xs text-brand-on-surface-variant font-mono uppercase tracking-widest font-bold">
                            <th className="py-4 px-6 text-center w-24">Barrel</th>
                            <th className="py-4 px-6">Quiz Title Location</th>
                            <th className="py-4 px-6 text-center">Completing Roster</th>
                            <th className="py-4 px-6 text-center">Average Score</th>
                            <th className="py-4 px-6 text-center">Average Time Evaluated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-brand-on-surface text-sm font-sans font-bold text-brand-on-surface">
                          {quizStats.map((q) => {
                            const isHardest = hardestQuiz && hardestQuiz.barrel_id === q.barrel_id && q.completions > 0;
                            const isLongest = longestQuiz && longestQuiz.barrel_id === q.barrel_id && q.completions > 0;
                            const isPopular = mostPopularQuiz && mostPopularQuiz.barrel_id === q.barrel_id && q.completions > 0;
                            const barPercent = Math.min((q.completions / maxCompletions) * 100, 100);

                            return (
                              <tr key={q.barrel_id} className="hover:bg-brand-surface-low">
                                <td className="py-4 px-6 text-center">
                                  <span className="inline-flex items-center justify-center h-8 w-8 bg-brand-mustard border-2 border-brand-on-surface font-mono text-xs shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] text-brand-on-surface">
                                    #{q.barrel_id.toString().padStart(2, '0')}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-display font-bold uppercase">{q.title}</div>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5 print:hidden">
                                    {isHardest && (
                                      <span className="font-mono text-[8px] font-black uppercase bg-red-100 text-brand-error px-2 py-0.5 border border-brand-error">
                                        ⚠️ Lowest Average Score
                                      </span>
                                    )}
                                    {isLongest && (
                                      <span className="font-mono text-[8px] font-black uppercase bg-brand-mustard/20 text-brand-on-surface px-2 py-0.5 border border-brand-mustard">
                                        ⏱️ Most Time Consuming
                                      </span>
                                    )}
                                    {isPopular && (
                                      <span className="font-mono text-[8px] font-black uppercase bg-brand-secondary/20 text-brand-on-secondary px-2 py-0.5 border border-brand-secondary">
                                        🔥 Most Completed
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-center font-mono text-xs">
                                  <div>{q.completions} chapters</div>
                                  <div className="w-24 bg-brand-surface-container h-2 border border-brand-on-surface mt-1 mx-auto overflow-hidden print:hidden">
                                    <div 
                                      className="bg-brand-secondary h-full"
                                      style={{ width: `${barPercent}%` }}
                                    ></div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-center font-mono text-brand-primary">+{q.average_score} XP</td>
                                <td className="py-4 px-6 text-center font-mono text-brand-secondary text-xs">{q.average_time_seconds}s</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* completion distribution */}
                  <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6">
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">QUIZ COMPLETION DISTRIBUTION</h3>
                    <div className="space-y-4">
                      {completionDist.map((item) => {
                        const percentage = summary.total_participants > 0 
                          ? (item.participant_count / summary.total_participants) * 100 
                          : 0;
                        return (
                          <div key={item.quizzes_completed} className="space-y-2">
                            <div className="flex justify-between font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider">
                              <span>Completed {item.quizzes_completed} / 10 Quiz Nodes</span>
                              <span className="text-brand-on-surface">{item.participant_count} Students ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="w-full bg-brand-surface-container h-6 border-2 border-brand-on-surface overflow-hidden">
                              <div 
                                className="bg-brand-secondary h-full border-r-2 border-brand-on-surface transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. PARTICIPANTS LIST TAB */}
            {activeTab === 'participants' && (
              <div className="space-y-6 animate-fade-in print:hidden">
                <div>
                  <input
                    type="text"
                    placeholder="SEARCH ROSTER BY Z-ID, NAME, OR ZONE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full input-brutalist px-4 py-3.5 text-xs font-mono uppercase"
                  />
                </div>

                <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-brand-on-surface border-b-2 border-brand-on-surface text-xs text-brand-surface font-mono uppercase tracking-widest font-bold">
                          <th className="py-4 px-6">Z-Id</th>
                          <th className="py-4 px-6">Participant</th>
                          <th className="py-4 px-6">Zone No.</th>
                          <th className="py-4 px-6">Phone</th>
                          <th className="py-4 px-6 text-center">Progress</th>
                          <th className="py-4 px-6 text-center">Score</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-center w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brand-on-surface text-brand-on-surface font-sans font-bold">
                        {filteredParticipants.map((p) => (
                          <tr key={p.id} className="hover:bg-brand-surface-low">
                            <td className="py-4 px-6 font-mono text-xs text-brand-secondary">{p.registration_id}</td>
                            <td className="py-4 px-6 font-display uppercase">{p.full_name}</td>
                            <td className="py-4 px-6 text-xs text-brand-on-surface-variant uppercase font-mono">{p.college_name}</td>
                            <td className="py-4 px-6 font-mono text-xs">{p.phone_number}</td>
                            <td className="py-4 px-6 text-center font-mono text-xs">{p.completed_quizzes} / 10</td>
                            <td className="py-4 px-6 text-center font-mono text-brand-primary text-sm">{p.total_score} XP</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex px-3 py-1 font-mono text-[9px] font-bold uppercase border ${
                                p.is_disabled
                                  ? 'bg-red-50 border-brand-error text-brand-error'
                                  : 'bg-green-50 border-emerald-600 text-emerald-700'
                              }`}>
                                {p.is_disabled ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleStatus(p.id, p.is_disabled)}
                                  className={`p-2 border-2 border-brand-on-surface transition-all cursor-pointer ${
                                    p.is_disabled
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                      : 'bg-brand-mustard text-brand-on-surface hover:bg-opacity-95'
                                  }`}
                                  title={p.is_disabled ? 'Activate student' : 'Suspend student'}
                                >
                                  {p.is_disabled ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteParticipant(p.id)}
                                  className="p-2 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container transition-all cursor-pointer"
                                  title="Delete record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BARREL PRINTABLE QR CODES TAB */}
            {activeTab === 'qrcodes' && (
              <div className="space-y-8 animate-fade-in">
                {/* Print Control panel */}
                <div className="p-6 border-4 border-brand-on-surface bg-brand-mustard text-brand-on-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
                  <div className="max-w-2xl">
                    <span className="font-mono text-[10px] font-bold block mb-1 uppercase tracking-widest">PRINT SPECIFICATIONS</span>
                    <p className="font-sans text-sm font-bold leading-relaxed">
                      Render physical placard labels for all 10 campus checkpoint barrels. Use the print command below to print directly onto card stock paper. Target paths are compiled dynamically.
                    </p>
                  </div>
                  <button
                    onClick={printQRCodes}
                    className="px-6 py-3.5 bg-brand-on-surface text-brand-surface border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4.5 w-4.5" />
                    PRINT QR CODES
                  </button>
                </div>

                {/* Printable placat nodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:text-black">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((barrelNum) => {
                    const scanLink = `${originUrl}/barrel/${barrelNum}`;
                    return (
                      <div 
                        key={barrelNum}
                        className="bg-brand-surface p-10 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] text-center space-y-6 flex flex-col items-center justify-center page-break-inside-avoid print:bg-white print:border-black print:text-black print:shadow-none print:p-8"
                      >
                        <div className="font-mono text-xs tracking-widest text-brand-on-surface uppercase font-black print:text-black border-b border-brand-on-surface pb-1">
                          NASA HYDERABAD HERITAGE HUNT 2026
                        </div>

                        <div>
                          <h2 className="font-display text-4xl font-black text-brand-on-surface print:text-black">BARREL TARGET #{barrelNum.toString().padStart(2, '0')}</h2>
                          <div className="font-mono text-[10px] text-brand-on-surface-variant print:text-black mt-1 font-bold uppercase">SCAN CODE TO TRIGGER TIMED CONTEST</div>
                        </div>

                        {/* High density QR code */}
                        <div className="p-4 bg-white border-4 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] print:shadow-none">
                          <QRCodeSVG 
                            value={scanLink} 
                            size={180} 
                            level="H"
                            includeMargin={false}
                          />
                        </div>

                        <div className="font-mono text-[9px] text-brand-on-surface-variant break-all max-w-[260px] font-bold">
                          {scanLink}
                        </div>

                        {/* Big Access Key display below QR */}
                        <div className="py-2 px-6 border-2 border-dashed border-brand-on-surface bg-brand-surface-low rounded-none w-full max-w-[280px] mx-auto">
                          <span className="font-mono text-[9px] font-bold text-brand-on-surface-variant block uppercase tracking-wide mb-1">
                            Access Keys (Fallback)
                          </span>
                          <div className="font-mono text-2xl font-black text-brand-primary uppercase tracking-widest print:text-black">
                            {BARREL_CODES[barrelNum].alpha}
                          </div>
                          <div className="font-mono text-lg font-black text-brand-secondary uppercase tracking-widest mt-0.5 print:text-black">
                            {BARREL_CODES[barrelNum].numeric}
                          </div>
                        </div>

                        <div className="w-full pt-4 border-t-2 border-brand-on-surface text-[10px] text-brand-on-surface-variant font-mono font-bold uppercase leading-normal">
                          DO NOT DISTURB OR DISPLACE THIS BARREL ASSEMBLY.<br />
                          ESTABLISHED FOR TOURNAMENT SECURITY AUDITS.
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. SYSTEM CONTROLS TAB */}
            {activeTab === 'database' && (
              <div className="space-y-6 animate-fade-in print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Database properties */}
                  <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6">
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase flex items-center gap-2">
                      <Database className="h-5 w-5 text-brand-secondary" />
                      DATABASE ENGINE STATE
                    </h3>
                    
                    <div className="space-y-4 text-xs font-mono font-bold">
                      <div className="flex justify-between border-b border-brand-on-surface pb-2 text-brand-on-surface-variant">
                        <span>DATA INSTANCE:</span>
                        <span className="text-brand-on-surface">SUPABASE POSTGRESQL</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-on-surface pb-2 text-brand-on-surface-variant">
                        <span>LIMITER STORAGE:</span>
                        <span className="text-brand-on-surface">UPSTASH REDIS</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-on-surface pb-2 text-brand-on-surface-variant">
                        <span>SANDBOX FALLBACK:</span>
                        <span className="px-2 py-0.5 border border-emerald-600 bg-green-50 text-emerald-700">
                          VERIFIED STABLE
                        </span>
                      </div>
                      <p className="font-sans text-xs text-brand-on-surface-variant leading-relaxed font-normal pt-2">
                        Query commands compile schemas dynamically. In the absence of server environment keys, participant sessions are written to <code className="font-mono font-bold text-brand-primary">mock_db.json</code> locally. Inject keys to synchronize physical PostgreSQL storage.
                      </p>
                    </div>
                  </div>

                  {/* Seed and reset panel */}
                  <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6">
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase flex items-center gap-2">
                      <AlertOctagon className="h-5 w-5 text-brand-primary" />
                      WIPES & SEED CHANNELS
                    </h3>

                    <div className="space-y-6">
                      {/* Seed questions */}
                      <div className="space-y-2">
                        <button
                          onClick={handleSeedQuestions}
                          disabled={seeding}
                          className="w-full py-4 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                          SEED QUESTION POOLS (200 ITEMS)
                        </button>
                        <p className="font-mono text-[9px] text-brand-on-surface-variant text-center font-bold uppercase leading-normal">
                          Performs bulk seeding of 200 items into the database instance.
                        </p>
                      </div>

                      {/* Reset event */}
                      <div className="space-y-2 pt-4 border-t-2 border-brand-on-surface">
                        <button
                          onClick={handleResetEvent}
                          disabled={wiping}
                          className="w-full py-4 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <AlertTriangle className="h-4.5 w-4.5" />
                          WIPE & RESET EVENT ROSTER
                        </button>
                        <p className="font-mono text-[9px] text-brand-error text-center font-bold uppercase leading-normal">
                          CRITICAL WARNING: Permanently purges registered students, clocks, scores, and audits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AUDIT LOGS TAB */}
            {activeTab === 'audits' && (
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6 animate-fade-in print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-on-surface pb-4">
                  <h3 className="font-display text-xl font-black text-brand-on-surface uppercase flex items-center gap-2">
                    <History className="h-5 w-5 text-brand-primary" />
                    Security and Activity Audit Trails
                  </h3>
                  <span className="font-mono text-xs font-bold bg-brand-surface-container border border-brand-on-surface px-2.5 py-1 text-brand-on-surface-variant uppercase">
                    {auditLogs.length} events logged
                  </span>
                </div>

                <div className="max-h-[500px] overflow-y-auto border-2 border-brand-on-surface divide-y-2 divide-brand-on-surface font-mono text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-surface-low transition-all">
                      <div className="space-y-1 max-w-xl">
                        <div className="text-brand-on-surface font-black text-sm uppercase">{log.action}</div>
                        <div className="text-brand-on-surface-variant flex flex-wrap gap-x-4 gap-y-1 font-bold text-[10px]">
                          <span>IP ADDRESS: {log.ip_address}</span>
                          <span>•</span>
                          <span>UA: {log.user_agent.substring(0, 60)}...</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-brand-secondary font-bold text-right shrink-0">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
