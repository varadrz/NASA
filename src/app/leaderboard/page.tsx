// Leaderboard Display Page (Bauhaus theme)
// Location: src/app/leaderboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Award, 
  Clock, 
  Compass, 
  HelpCircle, 
  RefreshCw, 
  Search, 
  Trophy 
} from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  college: string;
  score: number;
  time: number;
  completed?: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'overall' | 'zone' | 'quiz'>('overall');
  const [selectedBarrel, setSelectedBarrel] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const url = (activeTab === 'overall' || activeTab === 'zone')
        ? '/api/leaderboard?type=overall'
        : `/api/leaderboard?type=quiz&barrelId=${selectedBarrel}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
        if (data.quiz_title) setQuizTitle(data.quiz_title);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, selectedBarrel]);

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  const getZoneComparisonList = () => {
    const zoneStats: Record<string, { zone: string; participants: number; totalScore: number; totalTime: number; completedSum: number }> = {};
    for (let i = 1; i <= 6; i++) {
      zoneStats[`Zone ${i}`] = {
        zone: `Zone ${i}`,
        participants: 0,
        totalScore: 0,
        totalTime: 0,
        completedSum: 0
      };
    }

    leaderboard.forEach(item => {
      const zName = item.college;
      if (zoneStats[zName]) {
        zoneStats[zName].participants += 1;
        zoneStats[zName].totalScore += item.score;
        zoneStats[zName].totalTime += item.time;
        zoneStats[zName].completedSum += item.completed || 0;
      }
    });

    return Object.values(zoneStats)
      .map(z => ({
        ...z,
        avgScore: z.participants > 0 ? Math.round((z.totalScore / z.participants) * 10) / 10 : 0,
        avgTime: z.participants > 0 ? Math.round(z.totalTime / z.participants) : 0,
        avgCompleted: z.participants > 0 ? Math.round((z.completedSum / z.participants) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore || a.avgTime - b.avgTime)
      .map((z, idx) => ({ ...z, rank: idx + 1 }));
  };

  const zoneFilteredLeaderboard = leaderboard.filter(item => 
    selectedZone === 'all' || item.college === selectedZone
  );

  const rankedLeaderboard = zoneFilteredLeaderboard.map((item, index) => ({
    ...item,
    zoneRank: index + 1
  }));

  const filteredLeaderboard = rankedLeaderboard.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const barrelOptions = [
    { value: 1, label: "Barrel 1: Charminar & Qutb Shahi" },
    { value: 2, label: "Barrel 2: Golconda Fort" },
    { value: 3, label: "Barrel 3: Chowmahalla Palace" },
    { value: 4, label: "Barrel 4: Falaknuma Palace" },
    { value: 5, label: "Barrel 5: British Residency" },
    { value: 6, label: "Barrel 6: Deccan Vernacular" },
    { value: 7, label: "Barrel 7: Qutb Shahi Tombs" },
    { value: 8, label: "Barrel 8: Modernist Hyderabad" },
    { value: 9, label: "Barrel 9: Stepwells" },
    { value: 10, label: "Barrel 10: Moazzam Jahi Market" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8 pb-32">
        {/* Title Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-brand-on-surface pb-6">
          <div>
            <span className="font-mono text-[10px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              CONVENTION SCORES
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-on-surface flex items-center gap-2 tracking-tight">
              <Trophy className="h-8 w-8 text-brand-mustard" />
              Live Hunt Standings
            </h1>
            <p className="text-brand-on-surface-variant text-sm mt-2">
              Real-time standings of convention chapters based on score and server-clock completion times.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-3 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-surface-low active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'REFRESHING...' : 'FORCE REFRESH'}
          </button>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex flex-wrap items-center gap-4 border-b-2 border-brand-on-surface pb-4">
          <button
            onClick={() => {
              setActiveTab('overall');
              setSearchQuery('');
            }}
            className={`px-5 py-3 border-2 font-display text-xs uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeTab === 'overall'
                ? 'bg-brand-primary text-brand-on-primary border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] translate-x-[1px] translate-y-[1px]'
                : 'bg-brand-surface border-transparent text-brand-on-surface-variant hover:border-brand-on-surface'
            }`}
          >
            Overall Leaderboard
          </button>

          <button
            onClick={() => {
              setActiveTab('zone');
              setSearchQuery('');
            }}
            className={`px-5 py-3 border-2 font-display text-xs uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeTab === 'zone'
                ? 'bg-brand-primary text-brand-on-primary border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] translate-x-[1px] translate-y-[1px]'
                : 'bg-brand-surface border-transparent text-brand-on-surface-variant hover:border-brand-on-surface'
            }`}
          >
            Zone-Wise Leaderboard
          </button>
          
          <button
            onClick={() => {
              setActiveTab('quiz');
              setSearchQuery('');
            }}
            className={`px-5 py-3 border-2 font-display text-xs uppercase font-bold tracking-widest transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-brand-primary text-brand-on-primary border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] translate-x-[1px] translate-y-[1px]'
                : 'bg-brand-surface border-transparent text-brand-on-surface-variant hover:border-brand-on-surface'
            }`}
          >
            Quiz-Specific Leaderboard
          </button>

          {activeTab === 'quiz' && (
            <select
              value={selectedBarrel}
              onChange={(e) => setSelectedBarrel(Number(e.target.value))}
              className="ml-auto input-brutalist px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-brand-surface cursor-pointer"
            >
              {barrelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search Bar & Zone Filter */}
        {activeTab !== 'zone' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-outline">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                placeholder="SEARCH BY PARTICIPANT NAME..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input-brutalist pl-12 pr-4 py-3.5 text-xs font-mono uppercase placeholder:text-brand-outline-variant placeholder:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider whitespace-nowrap">Filter by Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="input-brutalist px-4 py-3 text-xs font-mono font-bold bg-brand-surface text-brand-on-surface uppercase tracking-wider cursor-pointer"
              >
                <option value="all">ALL ZONES</option>
                <option value="Zone 1">ZONE 1</option>
                <option value="Zone 2">ZONE 2</option>
                <option value="Zone 3">ZONE 3</option>
                <option value="Zone 4">ZONE 4</option>
                <option value="Zone 5">ZONE 5</option>
                <option value="Zone 6">ZONE 6</option>
              </select>
            </div>
          </div>
        )}

        {/* Podium Section - Only show when search query is empty, we have at least 3 participants, and not on Zone view */}
        {activeTab !== 'zone' && !searchQuery && !loading && filteredLeaderboard.length >= 3 && (
          <div className="grid grid-cols-3 items-end gap-3 md:gap-6 max-w-2xl mx-auto h-[220px] md:h-[300px] mt-4 mb-8">
            {/* Rank 2 */}
            {(() => {
              const r2 = filteredLeaderboard.find(item => (selectedZone === 'all' ? item.rank === 2 : item.zoneRank === 2));
              if (!r2) return <div />;
              return (
                <div className="flex flex-col items-center h-full justify-end animate-fade-in">
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-secondary border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-sm text-brand-on-secondary shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] uppercase">
                      {r2.name.substring(0, 2)}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-brand-on-surface text-brand-surface font-mono font-bold px-1.5 py-0.5 text-[8px] border border-brand-on-surface">
                      #2
                    </div>
                  </div>
                  <div className="w-full h-24 md:h-36 bg-brand-secondary border-t-2 border-x-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center p-2 text-center">
                    <p className="font-mono text-[9px] text-brand-on-secondary truncate w-full font-bold uppercase">{r2.name}</p>
                    <p className="font-display text-sm md:text-lg text-brand-on-secondary font-black mt-1">{r2.score} XP</p>
                  </div>
                </div>
              );
            })()}

            {/* Rank 1 */}
            {(() => {
              const r1 = filteredLeaderboard.find(item => (selectedZone === 'all' ? item.rank === 1 : item.zoneRank === 1));
              if (!r1) return <div />;
              return (
                <div className="flex flex-col items-center h-full justify-end scale-105 animate-fade-in">
                  <div className="relative mb-4 flex flex-col items-center">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-brand-mustard border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-base text-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] uppercase">
                      {r1.name.substring(0, 2)}
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-on-primary font-mono font-bold px-2 py-0.5 text-[8px] border-2 border-brand-on-surface shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                      CHAMPION
                    </div>
                  </div>
                  <div className="w-full h-32 md:h-48 bg-brand-primary border-t-2 border-x-2 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:10px_10px]" />
                    </div>
                    <p className="font-mono text-[10px] text-brand-on-primary truncate w-full font-black uppercase relative z-10">{r1.name}</p>
                    <p className="font-display text-lg md:text-2xl text-brand-on-primary font-black mt-1 relative z-10">{r1.score} XP</p>
                  </div>
                </div>
              );
            })()}

            {/* Rank 3 */}
            {(() => {
              const r3 = filteredLeaderboard.find(item => (selectedZone === 'all' ? item.rank === 3 : item.zoneRank === 3));
              if (!r3) return <div />;
              return (
                <div className="flex flex-col items-center h-full justify-end animate-fade-in">
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-mustard border-2 border-brand-on-surface flex items-center justify-center font-display font-black text-sm text-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] uppercase">
                      {r3.name.substring(0, 2)}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-brand-on-surface text-brand-surface font-mono font-bold px-1.5 py-0.5 text-[8px] border border-brand-on-surface">
                      #3
                    </div>
                  </div>
                  <div className="w-full h-20 md:h-28 bg-brand-mustard border-t-2 border-x-2 border-brand-on-surface shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] flex flex-col items-center justify-center p-2 text-center">
                    <p className="font-mono text-[9px] text-brand-on-surface truncate w-full font-bold uppercase">{r3.name}</p>
                    <p className="font-display text-sm md:text-lg text-brand-on-surface font-black mt-1">{r3.score} XP</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Leaderboard Table Container Block */}
        <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] overflow-hidden">
          
          {/* Header block for specific quiz */}
          {activeTab === 'quiz' && quizTitle && (
            <div className="bg-brand-mustard p-4 border-b-2 border-brand-on-surface text-brand-on-surface font-display font-black text-sm uppercase tracking-wider">
              DISPLAYING CHALLENGE MODULE: {quizTitle}
            </div>
          )}

          {loading ? (
            <div className="p-20 text-center text-brand-on-surface-variant font-mono flex flex-col items-center justify-center">
              <Compass className="h-10 w-10 text-brand-primary animate-spin mb-4" />
              <span className="text-xs font-bold uppercase tracking-widest">RETRIEVING LEADERBOARD INDEX...</span>
            </div>
          ) : activeTab === 'zone' ? (
            /* ZONE COMPARISON TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-brand-on-surface border-b-4 border-brand-on-surface text-xs text-brand-surface font-mono uppercase tracking-widest font-bold">
                    <th className="py-4 px-6 text-center w-24">Rank</th>
                    <th className="py-4 px-6">Zone Number</th>
                    <th className="py-4 px-6 text-center">Active Roster</th>
                    <th className="py-4 px-6 text-center">Total Points</th>
                    <th className="py-4 px-6 text-center">Avg Points / Student</th>
                    <th className="py-4 px-6 text-center">Avg Barrels Scanned</th>
                    <th className="py-4 px-6 text-center">Avg Completion Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-brand-on-surface text-sm font-sans font-bold">
                  {getZoneComparisonList().map((z) => {
                    const isTop3 = z.rank <= 3;
                    const rankStyle = 
                      z.rank === 1 ? 'bg-brand-mustard text-brand-on-surface border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      z.rank === 2 ? 'bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      z.rank === 3 ? 'bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      'bg-brand-surface-container border-2 border-transparent text-brand-on-surface-variant font-bold';

                    return (
                      <tr key={z.zone} className={`hover:bg-brand-surface-low transition duration-150 ${isTop3 ? 'bg-brand-mustard/5' : ''}`}>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center h-8 w-8 font-mono text-xs ${rankStyle}`}>
                            {z.rank.toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-display font-black text-brand-on-surface text-base uppercase">
                          {z.zone}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-brand-on-surface">
                          {z.participants} students
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-brand-primary font-black text-base">
                          {z.totalScore} XP
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-brand-secondary">
                          +{z.avgScore} XP
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-brand-on-surface-variant">
                          {z.avgCompleted} / 10
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-brand-on-surface">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <Clock className="h-3.5 w-3.5 text-brand-outline" />
                            {formatTime(z.avgTime)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-20 text-center text-brand-on-surface-variant font-mono flex flex-col items-center justify-center gap-2">
              <HelpCircle className="h-10 w-10 text-brand-outline" />
              <span className="text-xs font-bold uppercase tracking-wider">No participant records matching search criteria.</span>
            </div>
          ) : (
            /* PARTICIPANT TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-brand-on-surface border-b-4 border-brand-on-surface text-xs text-brand-surface font-mono uppercase tracking-widest font-bold">
                    <th className="py-4 px-6 text-center w-24">
                      {selectedZone === 'all' ? 'Rank' : 'Zone Rank'}
                    </th>
                    <th className="py-4 px-6">Participant Name</th>
                    <th className="py-4 px-6">Zone No.</th>
                    {activeTab === 'overall' && (
                      <th className="py-4 px-6 text-center">Barrels Scanned</th>
                    )}
                    <th className="py-4 px-6 text-center">Score</th>
                    <th className="py-4 px-6 text-center">Time Taken</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y-2 divide-brand-on-surface text-sm font-sans">
                  {filteredLeaderboard.map((item) => {
                    const currentRank = selectedZone === 'all' ? item.rank : item.zoneRank;
                    const isTop3 = currentRank <= 3;
                    
                    const rankStyle = 
                      currentRank === 1 ? 'bg-brand-mustard text-brand-on-surface border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      currentRank === 2 ? 'bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      currentRank === 3 ? 'bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-black shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]' :
                      'bg-brand-surface-container border-2 border-transparent text-brand-on-surface-variant font-bold';

                    return (
                      <tr 
                        key={item.name} 
                        className={`hover:bg-brand-surface-low transition duration-150 ${
                          isTop3 ? 'bg-brand-mustard/5' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center h-8 w-8 font-mono text-xs ${rankStyle}`}>
                            {currentRank.toString().padStart(2, '0')}
                          </span>
                          {selectedZone !== 'all' && (
                            <div className="text-[9px] font-mono text-brand-on-surface-variant mt-0.5">
                              #{item.rank} Overall
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-display font-bold text-brand-on-surface uppercase">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-brand-on-surface-variant uppercase font-mono text-xs font-bold">
                          {item.college}
                        </td>
                        {activeTab === 'overall' && (
                          <td className="py-4 px-6 text-center font-mono text-brand-secondary font-black text-xs">
                            {item.completed} / 10
                          </td>
                        )}
                        <td className="py-4 px-6 text-center font-mono font-black text-brand-primary text-sm">
                          {item.score} XP
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-brand-on-surface font-bold">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <Clock className="h-3.5 w-3.5 text-brand-outline" />
                            {formatTime(item.time)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footnote information banner */}
        <div className="p-4 bg-brand-surface-low border-2 border-brand-on-surface text-[10px] text-brand-on-surface-variant text-center font-mono font-bold uppercase tracking-wider leading-relaxed">
          TIEBREAKER REGULATION: Zones or participants with identical scores are sorted by lowest total time taken. All submissions are verified server-side via physical QR checkpoint auditing.
        </div>
      </main>
    </div>
  );
}
