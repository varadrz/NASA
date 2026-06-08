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
  Clock,
  BookOpen,
  Plus,
  Edit2,
  X,
  ArrowLeft,
  HelpCircle,
  Check,
  Search
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

interface StatsSummary {
  total_participants: number;
  active_participants: number;
  disabled_participants: number;
  completed_all_20: number;
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
  app_id?: string;
  full_name: string;
  college_name: string;
  phone_number: string;
  registration_id: string;
  instagram_id?: string;
  is_disabled: boolean;
  created_at: string;
  completed_quizzes: number;
  total_score: number;
  total_time: number;
  next_barrel_id: number | null;
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
  const [activeTab, setActiveTab] = useState<'stats' | 'participants' | 'quizzes' | 'qrcodes' | 'database' | 'audits' | 'schedule' | 'announcements'>('stats');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [completionDist, setCompletionDist] = useState<any[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStat[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [participants, setParticipants] = useState<ParticipantEnriched[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [originUrl, setOriginUrl] = useState('');

  // --- CRUD States for Schedule ---
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleSelectedDay, setScheduleSelectedDay] = useState<number | 'ALL'>('ALL');
  const [scheduleSelectedType, setScheduleSelectedType] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleEvent, setEditingScheduleEvent] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    id: '',
    day_idx: 0,
    time: '',
    startHour: 9.0,
    endHour: 10.0,
    speaker: '',
    topic: '',
    venue: '',
    type: 'Workshop'
  });

  const filteredSchedule = scheduleList.filter(event => {
    const eventDay = event.day_idx !== undefined ? event.day_idx : (event.dayIdx || 0);
    if (scheduleSelectedDay !== 'ALL' && eventDay !== scheduleSelectedDay) {
      return false;
    }

    if (scheduleSelectedType !== 'ALL' && event.type?.toUpperCase() !== scheduleSelectedType.toUpperCase()) {
      return false;
    }

    if (scheduleSearchQuery.trim()) {
      const query = scheduleSearchQuery.toLowerCase();
      const topic = (event.topic || '').toLowerCase();
      const speaker = (event.speaker || '').toLowerCase();
      const venue = (event.venue || '').toLowerCase();
      const type = (event.type || '').toLowerCase();
      if (!topic.includes(query) && !speaker.includes(query) && !venue.includes(query) && !type.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // --- States for Announcements ---
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: 'Notice',
    message: '',
    type: 'info',
    scheduled_for: '',
    expires_at: ''
  });

  // Confirmation states
  const [wiping, setWiping] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // --- CRUD States for Participants ---
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState<any | null>(null);
  const [partForm, setPartForm] = useState({
    id: '',
    full_name: '',
    college_name: '',
    phone_number: '',
    registration_id: '',
    instagram_id: '',
    is_disabled: false,
    completed_quizzes: 0,
    total_score: 0,
    total_time: 0,
    next_barrel_id: ''
  });

  // --- CRUD States for Quizzes ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [quizForm, setQuizForm] = useState({
    id: '',
    barrel_id: '',
    title: '',
    description: ''
  });

  // --- CRUD States for Questions ---
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionForm, setQuestionForm] = useState({
    id: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  });

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
        document.cookie = `admin_session=${password}; path=/; max-age=86400; SameSite=Strict`;
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
      document.cookie = `admin_session=${saved}; path=/; max-age=86400; SameSite=Strict`;
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

      const quizzesRes = await fetch('/api/admin/quizzes', { headers: { 'x-admin-password': pw } });
      if (quizzesRes.ok) {
        const data = await quizzesRes.json();
        setAllQuizzes(data.quizzes || []);
      }

      const auditRes = await fetch('/api/admin/audit-logs', { headers: { 'x-admin-password': pw } });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }

      const scheduleRes = await fetch('/api/admin/schedule', { headers: { 'x-admin-password': pw } });
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        setScheduleList(data || []);
      }

      const annRes = await fetch('/api/admin/announcements', { headers: { 'x-admin-password': pw } });
      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncementsList(data || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Schedule CRUD Handlers ---
  const handleSaveScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingScheduleEvent;
      const url = '/api/admin/schedule';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        ...scheduleForm,
        day_idx: Number(scheduleForm.day_idx),
        startHour: Number(scheduleForm.startHour),
        endHour: Number(scheduleForm.endHour)
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowScheduleModal(false);
        setEditingScheduleEvent(null);
        // Refresh schedule list
        const scheduleRes = await fetch('/api/admin/schedule', { headers: { 'x-admin-password': password } });
        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          setScheduleList(data || []);
        }
      } else {
        const err = await res.json();
        alert('Error saving event: ' + err.error);
      }
    } catch (err) {
      alert('Error connecting to schedule API.');
    }
  };

  const handleEditScheduleEvent = (event: any) => {
    setEditingScheduleEvent(event);
    setScheduleForm({
      id: event.id || '',
      day_idx: event.day_idx !== undefined ? Number(event.day_idx) : Number(event.dayIdx || 0),
      time: event.time || '',
      startHour: event.startHour !== undefined ? Number(event.startHour) : Number(event.start_hour || 9.0),
      endHour: event.endHour !== undefined ? Number(event.endHour) : Number(event.end_hour || 10.0),
      speaker: event.speaker || '',
      topic: event.topic || '',
      venue: event.venue || '',
      type: event.type || 'Workshop'
    });
    setShowScheduleModal(true);
  };

  const handleDeleteScheduleEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule event?')) return;
    try {
      const res = await fetch(`/api/admin/schedule?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const scheduleRes = await fetch('/api/admin/schedule', { headers: { 'x-admin-password': password } });
        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          setScheduleList(data || []);
        }
      } else {
        alert('Error deleting event.');
      }
    } catch (err) {
      alert('Error connecting to schedule API.');
    }
  };

  // --- Announcements CRUD Handlers ---
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: annForm.title || 'Notice',
        message: annForm.message,
        type: annForm.type || 'info',
        scheduled_for: annForm.scheduled_for ? new Date(annForm.scheduled_for).toISOString() : new Date().toISOString(),
        expires_at: annForm.expires_at ? new Date(annForm.expires_at).toISOString() : null
      };

      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAnnModal(false);
        setAnnForm({ title: 'Notice', message: '', type: 'info', scheduled_for: '', expires_at: '' });
        // Refresh announcements list
        const annRes = await fetch('/api/admin/announcements', { headers: { 'x-admin-password': password } });
        if (annRes.ok) {
          const data = await annRes.json();
          setAnnouncementsList(data || []);
        }
      } else {
        const err = await res.json();
        alert('Error sending announcement: ' + err.error);
      }
    } catch (err) {
      alert('Error connecting to announcements API.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement? It will stop showing for all users.')) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const annRes = await fetch('/api/admin/announcements', { headers: { 'x-admin-password': password } });
        if (annRes.ok) {
          const data = await annRes.json();
          setAnnouncementsList(data || []);
        }
      } else {
        alert('Error deleting announcement.');
      }
    } catch (err) {
      alert('Error connecting to announcements API.');
    }
  };

  // --- Participant CRUD Handlers ---
  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingPart;
      const payload = {
        action: isEdit ? 'update' : 'create',
        ...partForm
      };
      
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Participant saved successfully!');
        setShowPartModal(false);
        fetchDashboardData(password, true);
      } else {
        alert(data.error || 'Failed to save participant.');
      }
    } catch (err) {
      alert('Network or client error saving participant details.');
    }
  };

  const openCreateParticipant = () => {
    setEditingPart(null);
    setPartForm({
      id: '',
      full_name: '',
      college_name: '',
      phone_number: '',
      registration_id: '',
      instagram_id: '',
      is_disabled: false,
      completed_quizzes: 0,
      total_score: 0,
      total_time: 0,
      next_barrel_id: '1'
    });
    setShowPartModal(true);
  };

  const openEditParticipant = (p: ParticipantEnriched) => {
    setEditingPart(p);
    setPartForm({
      id: p.id,
      full_name: p.full_name,
      college_name: p.college_name,
      phone_number: p.phone_number,
      registration_id: p.registration_id,
      instagram_id: p.instagram_id || '',
      is_disabled: p.is_disabled,
      completed_quizzes: p.completed_quizzes,
      total_score: p.total_score,
      total_time: p.total_time,
      next_barrel_id: p.next_barrel_id ? String(p.next_barrel_id) : ''
    });
    setShowPartModal(true);
  };

  // --- Quiz CRUD Handlers ---
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingQuiz;
      const res = await fetch('/api/admin/quizzes', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(quizForm)
      });

      const data = await res.json();
      if (res.ok) {
        alert(isEdit ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        setShowQuizModal(false);
        fetchDashboardData(password, true);
      } else {
        alert(data.error || 'Failed to save quiz.');
      }
    } catch (err) {
      alert('Network error saving quiz.');
    }
  };

  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      id: '',
      barrel_id: '',
      title: '',
      description: ''
    });
    setShowQuizModal(true);
  };

  const openEditQuiz = (q: any) => {
    setEditingQuiz(q);
    setQuizForm({
      id: q.id,
      barrel_id: String(q.barrel_id),
      title: q.title,
      description: q.description
    });
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All associated questions will be deleted!')) return;
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        alert('Quiz deleted successfully!');
        fetchDashboardData(password, true);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete quiz.');
      }
    } catch (err) {
      alert('Network error deleting quiz.');
    }
  };

  // --- Question CRUD Handlers ---
  const fetchQuestions = async (quizId: string) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/admin/questions?quiz_id=${quizId}`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openManageQuestions = (quiz: any) => {
    setActiveQuizForQuestions(quiz);
    fetchQuestions(quiz.id);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestions) return;
    try {
      const isEdit = !!editingQuestion;
      const payload = {
        ...questionForm,
        quiz_id: activeQuizForQuestions.id
      };

      const res = await fetch('/api/admin/questions', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(isEdit ? 'Question updated successfully!' : 'Question created successfully!');
        setShowQuestionModal(false);
        fetchQuestions(activeQuizForQuestions.id);
      } else {
        alert(data.error || 'Failed to save question.');
      }
    } catch (err) {
      alert('Network error saving question.');
    }
  };

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      id: '',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A'
    });
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        alert('Question deleted successfully!');
        if (activeQuizForQuestions) fetchQuestions(activeQuizForQuestions.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete question.');
      }
    } catch (err) {
      alert('Network error deleting question.');
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
    p.registration_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.app_id && p.app_id.toLowerCase().includes(searchQuery.toLowerCase()))
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
            { id: 'quizzes', label: 'Quizzes & Questions', icon: BookOpen },
            { id: 'schedule', label: 'Schedule Manager', icon: Clock },
            { id: 'announcements', label: 'Broadcast Updates', icon: AlertOctagon },
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
                      { label: 'Completed All 20', val: summary.completed_all_20, icon: Trophy, color: 'bg-brand-mustard border-brand-on-surface text-brand-on-surface' },
                      { label: 'Average Score', val: `${summary.average_score} / 1000`, icon: CheckCircle2, color: 'bg-brand-secondary border-brand-on-surface text-brand-on-secondary' },
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
                              <span>Completed {item.quizzes_completed} / 20 Quiz Nodes</span>
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
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="SEARCH ROSTER BY REGISTRATION ID, NAME, COLLEGE OR INSTAGRAM ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full input-brutalist px-4 py-3.5 text-xs font-mono uppercase"
                    />
                  </div>
                  <button
                    onClick={openCreateParticipant}
                    className="px-5 py-3.5 border-4 border-brand-on-surface bg-brand-mustard text-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    ADD PARTICIPANT
                  </button>
                </div>

                <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-brand-on-surface border-b-2 border-brand-on-surface text-xs text-brand-surface font-mono uppercase tracking-widest font-bold">
                          <th className="py-4 px-6">Reg ID</th>
                          <th className="py-4 px-6">App ID</th>
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
                            <td className="py-4 px-6 font-mono text-xs text-brand-primary">{p.app_id || 'N/A'}</td>
                            <td className="py-4 px-6">
                              <div className="font-display uppercase font-bold">{p.full_name}</div>
                              {p.instagram_id && (
                                <a 
                                  href={`https://instagram.com/${p.instagram_id.replace(/^@/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono text-brand-secondary hover:underline lowercase block mt-0.5"
                                >
                                  @{p.instagram_id.replace(/^@/, '')}
                                </a>
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-brand-on-surface-variant uppercase font-mono">{p.college_name}</td>
                            <td className="py-4 px-6 font-mono text-xs">{p.phone_number}</td>
                            <td className="py-4 px-6 text-center font-mono text-xs">{p.completed_quizzes} / 20</td>
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
                                  onClick={() => openEditParticipant(p)}
                                  className="p-2 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface hover:bg-brand-surface-low transition-all cursor-pointer"
                                  title="Edit student details"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
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

            {/* 3. QUIZZES & QUESTIONS TAB */}
            {activeTab === 'quizzes' && (
              <div className="space-y-6 animate-fade-in print:hidden">
                {activeQuizForQuestions ? (
                  /* Questions CRUD Manager */
                  <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-brand-on-surface pb-4">
                      <div>
                        <button
                          onClick={() => setActiveQuizForQuestions(null)}
                          className="font-mono text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1.5 uppercase mb-2"
                        >
                          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
                        </button>
                        <h2 className="font-display text-2xl font-black text-brand-on-surface uppercase">
                          Questions Pool for Barrel #{activeQuizForQuestions.barrel_id.toString().padStart(2, '0')}
                        </h2>
                        <p className="text-brand-on-surface-variant text-xs font-mono uppercase mt-1">
                          {activeQuizForQuestions.title}
                        </p>
                      </div>
                      <button
                        onClick={openCreateQuestion}
                        className="px-4 py-2.5 border-2 border-brand-on-surface bg-brand-mustard text-brand-on-surface font-display font-bold text-xs uppercase hover:bg-opacity-95 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Add Question
                      </button>
                    </div>

                    {loadingQuestions ? (
                      <div className="py-12 text-center text-brand-on-surface-variant font-mono">
                        <Compass className="h-8 w-8 text-brand-primary animate-spin mx-auto mb-2" />
                        <span className="text-xs">LOADING QUESTIONS CHANNELS...</span>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="py-12 text-center text-brand-on-surface-variant font-mono border-4 border-dashed border-brand-surface-container">
                        No questions configured for this quiz yet. Click "Add Question" above to initialize.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questions.map((q, idx) => (
                          <div key={q.id || idx} className="p-4 border-2 border-brand-on-surface bg-brand-surface-low space-y-3 shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">
                            <div className="flex justify-between items-start gap-4">
                              <span className="font-mono text-xs font-black bg-brand-on-surface text-brand-surface px-2 py-0.5">
                                Q#{idx + 1}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditQuestion(q)}
                                  className="p-1.5 border border-brand-on-surface bg-white text-brand-on-surface hover:bg-brand-surface-low cursor-pointer"
                                  title="Edit Question"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1.5 border border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-opacity-95 cursor-pointer"
                                  title="Delete Question"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="font-sans font-bold text-sm text-brand-on-surface">{q.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                              <div className={`p-2 border ${q.correct_answer === 'A' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black' : 'border-brand-surface-container'}`}>
                                A. {q.option_a}
                              </div>
                              <div className={`p-2 border ${q.correct_answer === 'B' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black' : 'border-brand-surface-container'}`}>
                                B. {q.option_b}
                              </div>
                              <div className={`p-2 border ${q.correct_answer === 'C' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black' : 'border-brand-surface-container'}`}>
                                C. {q.option_c}
                              </div>
                              <div className={`p-2 border ${q.correct_answer === 'D' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black' : 'border-brand-surface-container'}`}>
                                D. {q.option_d}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Quizzes List Dashboard */
                  <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-black text-brand-on-surface uppercase">Heritage Hunt Quizzes</h2>
                        <p className="text-brand-on-surface-variant text-xs">Configure the 20 barrel locations, instructions, and questions pool.</p>
                      </div>
                      <button
                        onClick={openCreateQuiz}
                        className="px-5 py-3 border-4 border-brand-on-surface bg-brand-mustard text-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] cursor-pointer flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Quiz
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {allQuizzes.length === 0 ? (
                        <div className="col-span-2 py-12 text-center text-brand-on-surface-variant font-mono">
                          No quizzes loaded. Check database connectivity or click "Add Quiz" above to initialize.
                        </div>
                      ) : (
                        [...allQuizzes].sort((a, b) => a.barrel_id - b.barrel_id).map((q) => (
                          <div key={q.id} className="bg-brand-surface border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b-2 border-brand-on-surface pb-2">
                                <span className="inline-flex items-center justify-center h-8 w-8 bg-brand-mustard border-2 border-brand-on-surface font-mono text-xs font-bold text-brand-on-surface">
                                  #{q.barrel_id.toString().padStart(2, '0')}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditQuiz(q)}
                                    className="p-1.5 border border-brand-on-surface bg-white text-brand-on-surface hover:bg-brand-surface-low cursor-pointer"
                                    title="Edit Quiz"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuiz(q.id)}
                                    className="p-1.5 border border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-opacity-95 cursor-pointer"
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-display text-lg font-black text-brand-on-surface uppercase leading-snug">{q.title}</h3>
                              <p className="font-sans text-xs text-brand-on-surface-variant leading-relaxed line-clamp-3">{q.description}</p>
                            </div>
                            <button
                              onClick={() => openManageQuestions(q)}
                              className="w-full py-2.5 border-2 border-brand-on-surface bg-brand-secondary text-brand-on-secondary font-display font-bold text-xs uppercase hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5 mt-4"
                            >
                              <HelpCircle className="h-4 w-4" /> Manage Questions
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. BARREL PRINTABLE QR CODES TAB */}
            {activeTab === 'qrcodes' && (
              <div className="space-y-8 animate-fade-in">
                {/* Print Control panel */}
                <div className="p-6 border-4 border-brand-on-surface bg-brand-mustard text-brand-on-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
                  <div className="max-w-2xl">
                    <span className="font-mono text-[10px] font-bold block mb-1 uppercase tracking-widest">PRINT SPECIFICATIONS</span>
                    <p className="font-sans text-sm font-bold leading-relaxed">
                      Render physical placard labels for all 20 campus checkpoint barrels. Use the print command below to print directly onto card stock paper. Target paths are compiled dynamically.
                    </p>
                  </div>
                  <a
                    href="/admin/print"
                    target="_blank"
                    className="px-6 py-3.5 bg-brand-on-surface text-brand-surface border-2 border-brand-on-surface font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4.5 w-4.5" />
                    OPEN PRINT DASHBOARD (A3)
                  </a>
                </div>

                {/* Printable placat nodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:text-black">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((barrelNum) => {
                    const scanLink = `${originUrl}/barrel/${barrelNum}`;
                    return (
                      <div 
                        key={barrelNum}
                        className="bg-brand-surface p-10 border-4 border-brand-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] text-center space-y-6 flex flex-col items-center justify-center page-break-inside-avoid print:bg-white print:border-black print:text-black print:shadow-none print:p-8"
                      >
                        <div className="font-mono text-xs tracking-widest text-brand-on-surface uppercase font-black print:text-black border-b border-brand-on-surface pb-1">
                          NASA HYDERABAD INSTAGRAM HUNT 2026
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
                            Access Key (Fallback)
                          </span>
                          <div className="font-mono text-2xl font-black text-brand-primary uppercase tracking-widest print:text-black">
                            {BARREL_CODES[barrelNum]}
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

            {/* SCHEDULE MANAGER TAB */}
            {activeTab === 'schedule' && (
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6 animate-fade-in print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-on-surface pb-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-primary" />
                      Convention Schedule Events
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant">
                      Manage session times, topics, speakers, and locations for all convention days.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingScheduleEvent(null);
                      setScheduleForm({
                        id: '',
                        day_idx: 0,
                        time: '',
                        startHour: 9.0,
                        endHour: 10.0,
                        speaker: '',
                        topic: '',
                        venue: '',
                        type: 'Workshop'
                      });
                      setShowScheduleModal(true);
                    }}
                    className="px-4 py-2 bg-brand-primary text-brand-on-primary border-2 border-brand-on-surface font-display text-xs uppercase font-bold tracking-widest shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    ADD SCHEDULE EVENT
                  </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-brand-surface-low border-2 border-brand-on-surface p-4">
                  {/* Search Input */}
                  <div className="flex-grow max-w-md">
                    <div className="flex border-2 border-brand-on-surface bg-brand-surface focus-within:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all">
                      <span className="flex items-center justify-center px-3 bg-brand-surface-container text-brand-on-surface border-r-2 border-brand-on-surface">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search by topic, speaker, venue, or type..."
                        value={scheduleSearchQuery}
                        onChange={(e) => setScheduleSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-transparent text-brand-on-surface outline-none border-none font-mono font-bold"
                      />
                      {scheduleSearchQuery && (
                        <button
                          onClick={() => setScheduleSearchQuery('')}
                          className="px-2 text-brand-on-surface-variant hover:text-brand-primary cursor-pointer font-bold"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Dropdown / Day Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Day selector tabs */}
                    <div className="flex border-2 border-brand-on-surface bg-brand-surface divide-x-2 divide-brand-on-surface overflow-hidden">
                      {([
                        { value: 'ALL', label: 'All Days' },
                        { value: 0, label: 'Day 1' },
                        { value: 1, label: 'Day 2' },
                        { value: 2, label: 'Day 3' },
                        { value: 3, label: 'Day 4' }
                      ] as const).map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => setScheduleSelectedDay(day.value)}
                          className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            scheduleSelectedDay === day.value
                              ? 'bg-brand-primary text-brand-on-primary font-black'
                              : 'text-brand-on-surface hover:bg-brand-surface-low'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>

                    {/* Type selector select */}
                    <div className="flex border-2 border-brand-on-surface bg-brand-surface overflow-hidden">
                      <select
                        value={scheduleSelectedType}
                        onChange={(e) => setScheduleSelectedType(e.target.value)}
                        className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-on-surface bg-transparent outline-none border-none cursor-pointer"
                      >
                        <option value="ALL">All Types</option>
                        <option value="MASTERCLASS">Masterclass</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="NEXUS EVENT">Nexus Event</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border-2 border-brand-on-surface">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-surface-low border-b-2 border-brand-on-surface text-xs text-brand-on-surface-variant font-mono uppercase tracking-widest font-bold">
                        <th className="py-3 px-4">Day</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Topic / Event</th>
                        <th className="py-3 px-4">Speaker</th>
                        <th className="py-3 px-4">Venue</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-brand-on-surface text-xs font-sans font-bold text-brand-on-surface bg-white">
                      {filteredSchedule.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-brand-on-surface-variant font-mono uppercase">
                            No matching schedule events found.
                          </td>
                        </tr>
                      ) : (
                        [...filteredSchedule]
                          .sort((a, b) => {
                            const dayA = a.day_idx !== undefined ? a.day_idx : (a.dayIdx || 0);
                            const dayB = b.day_idx !== undefined ? b.day_idx : (b.dayIdx || 0);
                            if (dayA !== dayB) return dayA - dayB;
                            const startA = a.startHour !== undefined ? a.startHour : (a.start_hour || 0);
                            const startB = b.startHour !== undefined ? b.startHour : (b.start_hour || 0);
                            return startA - startB;
                          })
                          .map((event) => {
                            const dIdx = event.day_idx !== undefined ? event.day_idx : (event.dayIdx || 0);
                            return (
                              <tr key={event.id} className="hover:bg-brand-surface-low transition-colors">
                                <td className="py-3 px-4 font-mono font-black text-brand-secondary">
                                  DAY {dIdx + 1}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  {event.time}
                                </td>
                                <td className="py-3 px-4 font-display font-black uppercase max-w-xs truncate">
                                  {event.topic}
                                </td>
                                <td className="py-3 px-4 font-sans">
                                  {event.speaker || '—'}
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px]">
                                  {event.venue}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                                    event.type?.toUpperCase() === 'MASTERCLASS' ? 'bg-brand-primary text-brand-on-primary' :
                                    event.type?.toUpperCase() === 'SEMINAR' ? 'bg-brand-secondary text-brand-on-secondary' :
                                    event.type?.toUpperCase() === 'WORKSHOP' ? 'bg-brand-tertiary text-brand-on-tertiary' :
                                    event.type?.toUpperCase() === 'NEXUS EVENT' ? 'bg-brand-mustard text-brand-on-surface border border-brand-on-surface' :
                                    'bg-brand-surface-highest text-brand-on-surface'
                                  }`}>
                                    {event.type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditScheduleEvent(event)}
                                      className="p-1 border border-brand-on-surface bg-brand-surface-highest hover:bg-brand-surface-high cursor-pointer"
                                      title="Edit Event"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteScheduleEvent(event.id)}
                                      className="p-1 border border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                                      title="Delete Event"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BROADCAST ANNOUNCEMENTS TAB */}
            {activeTab === 'announcements' && (
              <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-6 md:p-8 space-y-6 animate-fade-in print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-on-surface pb-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-black text-brand-on-surface uppercase flex items-center gap-2">
                      <AlertOctagon className="h-5 w-5 text-brand-primary" />
                      Broadcast Announcements (Scheduled Updates)
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant">
                      Publish announcements, notifications and important updates. Users will receive these in the app instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAnnForm({
                        title: 'Notice',
                        message: '',
                        type: 'info',
                        scheduled_for: '',
                        expires_at: ''
                      });
                      setShowAnnModal(true);
                    }}
                    className="px-4 py-2 bg-brand-secondary text-brand-on-secondary border-2 border-brand-on-surface font-display text-xs uppercase font-bold tracking-widest shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    CREATE BROADCAST
                  </button>
                </div>

                <div className="overflow-x-auto border-2 border-brand-on-surface">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-surface-low border-b-2 border-brand-on-surface text-xs text-brand-on-surface-variant font-mono uppercase tracking-widest font-bold">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Scheduled For</th>
                        <th className="py-3 px-4">Expires At</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-brand-on-surface text-xs font-sans font-bold text-brand-on-surface bg-white">
                      {announcementsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-brand-on-surface-variant font-mono uppercase">
                            No announcements found.
                          </td>
                        </tr>
                      ) : (
                        [...announcementsList]
                          .sort((a, b) => new Date(b.created_at || b.scheduled_for).getTime() - new Date(a.created_at || a.scheduled_for).getTime())
                          .map((ann) => {
                            const now = new Date();
                            const sched = new Date(ann.scheduled_for);
                            const expires = ann.expires_at ? new Date(ann.expires_at) : null;
                            const isLive = sched <= now && (!expires || expires > now);
                            const isScheduled = sched > now;
                            const isExpired = expires && expires <= now;

                            return (
                              <tr key={ann.id} className="hover:bg-brand-surface-low transition-colors">
                                <td className="py-3 px-4 font-display font-black uppercase text-brand-primary">
                                  {ann.title}
                                </td>
                                <td className="py-3 px-4 max-w-xs truncate" title={ann.message}>
                                  {ann.message}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                                    ann.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
                                    ann.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                    ann.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                                    'bg-blue-100 text-blue-800 border border-blue-300'
                                  }`}>
                                    {ann.type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px]">
                                  {new Date(ann.scheduled_for).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px]">
                                  {ann.expires_at ? new Date(ann.expires_at).toLocaleString() : 'Never'}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-[9px] uppercase">
                                  {isLive && <span className="text-green-600">● Live</span>}
                                  {isScheduled && <span className="text-blue-500">Scheduled</span>}
                                  {isExpired && <span className="text-gray-400">Expired</span>}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                    className="p-1 border border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                                    title="Delete Announcement"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Schedule CRUD Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden overflow-y-auto animate-fade-in">
            <div className="bg-brand-surface border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] max-w-lg w-full p-6 md:p-8 space-y-6 my-8">
              <div className="flex justify-between items-center border-b-4 border-brand-on-surface pb-3">
                <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                  {editingScheduleEvent ? 'Edit Schedule Event' : 'Add New Schedule Event'}
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScheduleEvent} className="space-y-4 font-sans font-bold text-xs text-brand-on-surface">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Day of Convention</label>
                    <select
                      value={scheduleForm.day_idx}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day_idx: Number(e.target.value) })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono font-bold bg-white"
                    >
                      <option value={0}>Day 1 (June 11th)</option>
                      <option value={1}>Day 2 (June 12th)</option>
                      <option value={2}>Day 3 (June 13th)</option>
                      <option value={3}>Day 4 (June 14th)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Event Type Category</label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono font-bold bg-white"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Masterclass">Masterclass</option>
                      <option value="Nexus Event">Nexus Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Time Label Display (e.g. "09:30 AM – 11:00 AM")</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    placeholder="09:30 AM – 11:00 AM"
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Start Hour Decimal (e.g. 9.5)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={scheduleForm.startHour}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startHour: Number(e.target.value) })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">End Hour Decimal (e.g. 11.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={scheduleForm.endHour}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endHour: Number(e.target.value) })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Speaker / Presenter</label>
                  <input
                    type="text"
                    value={scheduleForm.speaker}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, speaker: e.target.value })}
                    placeholder="Leave blank if none"
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Topic / Event Title</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.topic}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
                    placeholder="Event Title"
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Venue Room / Location</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.venue}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    placeholder="Seminar Room A-012"
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-secondary text-brand-on-secondary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer mt-4"
                >
                  SAVE SCHEDULE EVENT
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Broadcast Modal */}
        {showAnnModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden overflow-y-auto animate-fade-in">
            <div className="bg-brand-surface border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] max-w-lg w-full p-6 md:p-8 space-y-6 my-8">
              <div className="flex justify-between items-center border-b-4 border-brand-on-surface pb-3">
                <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                  Broadcast New Updates Notification
                </h3>
                <button
                  onClick={() => setShowAnnModal(false)}
                  className="p-1 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4 font-sans font-bold text-xs text-brand-on-surface">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    placeholder="e.g. Schedule Update / Critical Notice"
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Broadcast Message Body</label>
                  <textarea
                    required
                    value={annForm.message}
                    onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                    placeholder="Write the announcement description..."
                    rows={4}
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Notice Category Level</label>
                    <select
                      value={annForm.type}
                      onChange={(e) => setAnnForm({ ...annForm, type: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono font-bold bg-white"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="error">Critical Alert (Red)</option>
                      <option value="success">Success / Alert (Green)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Scheduled for (Optional)</label>
                    <input
                      type="datetime-local"
                      value={annForm.scheduled_for}
                      onChange={(e) => setAnnForm({ ...annForm, scheduled_for: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Expiration Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={annForm.expires_at}
                    onChange={(e) => setAnnForm({ ...annForm, expires_at: e.target.value })}
                    className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary text-brand-on-primary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-y-[1px] cursor-pointer mt-4"
                >
                  BROADCAST NOTICE TO ALL SYSTEM CONSOLES
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Participant CRUD Modal */}
        {showPartModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden overflow-y-auto">
            <div className="bg-brand-surface border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] max-w-lg w-full p-6 md:p-8 space-y-6 my-8">
              <div className="flex justify-between items-center border-b-4 border-brand-on-surface pb-3">
                <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                  {editingPart ? 'Edit Participant Details' : 'Register New Participant'}
                </h3>
                <button
                  onClick={() => setShowPartModal(false)}
                  className="p-1 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveParticipant} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={partForm.full_name}
                    onChange={(e) => setPartForm({ ...partForm, full_name: e.target.value })}
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Registration ID</label>
                    <input
                      type="text"
                      required
                      value={partForm.registration_id}
                      onChange={(e) => setPartForm({ ...partForm, registration_id: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">College/Zone</label>
                    <input
                      type="text"
                      required
                      value={partForm.college_name}
                      onChange={(e) => setPartForm({ ...partForm, college_name: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={partForm.phone_number}
                      onChange={(e) => setPartForm({ ...partForm, phone_number: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Instagram ID</label>
                    <input
                      type="text"
                      value={partForm.instagram_id}
                      onChange={(e) => setPartForm({ ...partForm, instagram_id: e.target.value })}
                      className="w-full input-brutalist px-3 py-2 text-xs font-mono lowercase"
                      placeholder="e.g. user_handle"
                    />
                  </div>
                </div>

                <div className="border-2 border-brand-on-surface p-4 bg-brand-surface-low space-y-4">
                  <span className="block font-mono text-xs font-black uppercase text-brand-primary border-b border-brand-on-surface pb-1.5">
                    Quest Progression Overrides
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Completed Quizzes (0-20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={partForm.completed_quizzes}
                        onChange={(e) => setPartForm({ ...partForm, completed_quizzes: parseInt(e.target.value || '0', 10) })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Next Target Barrel (1-20)</label>
                      <select
                        value={partForm.next_barrel_id}
                        onChange={(e) => setPartForm({ ...partForm, next_barrel_id: e.target.value })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-mono bg-white"
                      >
                        <option value="">None (Finished)</option>
                        {Array.from({ length: 20 }, (_, i) => String(i + 1)).map((num) => (
                          <option key={num} value={num}>Barrel #{num.padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Total Score (XP)</label>
                      <input
                        type="number"
                        value={partForm.total_score}
                        onChange={(e) => setPartForm({ ...partForm, total_score: parseInt(e.target.value || '0', 10) })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Total Hunt Duration (sec)</label>
                      <input
                        type="number"
                        value={partForm.total_time}
                        onChange={(e) => setPartForm({ ...partForm, total_time: parseInt(e.target.value || '0', 10) })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_disabled_check"
                    checked={partForm.is_disabled}
                    onChange={(e) => setPartForm({ ...partForm, is_disabled: e.target.checked })}
                    className="h-4 w-4 border-2 border-brand-on-surface text-brand-primary"
                  />
                  <label htmlFor="is_disabled_check" className="font-mono text-xs font-bold text-brand-on-surface uppercase cursor-pointer">
                    SUSPEND / DISABLE PARTICIPANT LOGIN ACCESS
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-secondary text-brand-on-secondary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer mt-4"
                >
                  SAVE RECORD
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Quiz CRUD Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden overflow-y-auto">
            <div className="bg-brand-surface border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] max-w-md w-full p-6 md:p-8 space-y-6 my-8">
              <div className="flex justify-between items-center border-b-4 border-brand-on-surface pb-3">
                <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                  {editingQuiz ? 'Edit Quiz Barrel' : 'Create Quiz Barrel'}
                </h3>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="p-1 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuiz} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Barrel ID (1-20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={quizForm.barrel_id}
                    onChange={(e) => setQuizForm({ ...quizForm, barrel_id: e.target.value })}
                    className="w-full input-brutalist px-3 py-2 text-xs font-mono"
                    disabled={!!editingQuiz}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Quiz Instructions / Description</label>
                  <textarea
                    required
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    rows={4}
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-secondary text-brand-on-secondary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer mt-4"
                >
                  SAVE QUIZ BARREL
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Question CRUD Modal */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden overflow-y-auto">
            <div className="bg-brand-surface border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] max-w-lg w-full p-6 md:p-8 space-y-6 my-8">
              <div className="flex justify-between items-center border-b-4 border-brand-on-surface pb-3">
                <h3 className="font-display text-xl font-black text-brand-on-surface uppercase">
                  {editingQuestion ? 'Edit Question' : 'Add Question to Quiz'}
                </h3>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-1 border-2 border-brand-on-surface bg-brand-primary text-brand-on-primary hover:bg-brand-primary-container cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Question Prompt Text</label>
                  <textarea
                    required
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    rows={3}
                    className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block font-mono text-xs font-black uppercase text-brand-primary">Answer Options</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Option A</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Option B</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Option C</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Option D</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                        className="w-full input-brutalist px-3 py-2 text-xs font-sans font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider mb-1">Correct Choice</label>
                  <select
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    className="w-full input-brutalist px-3 py-2 text-xs font-mono font-bold bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-secondary text-brand-on-secondary border-4 border-brand-on-surface font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[1px] cursor-pointer mt-4"
                >
                  SAVE QUESTION
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
