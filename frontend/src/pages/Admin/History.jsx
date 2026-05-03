import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, MapPin, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Loader2, Clock, Database, ArrowRight
} from 'lucide-react';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    completed:  { icon: <CheckCircle2 size={11} />, label: 'Completed', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
    failed:     { icon: <XCircle size={11} />,      label: 'Failed',    cls: 'text-red-400 border-red-400/30 bg-red-400/10' },
    processing: { icon: <Loader2 size={11} className="animate-spin" />, label: 'Processing', cls: 'text-orange-400 border-orange-400/30 bg-orange-400/10' },
    pending:    { icon: <Clock size={11} />,         label: 'Pending',   cls: 'text-gray-400 border-gray-600 bg-gray-800/50' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-800/60 rounded w-1/2" />
      <div className="h-3 bg-gray-800/40 rounded w-1/4" />
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function HistoryPage() {
  const navigate = useNavigate();

  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]     = useState(1);
  const [total, setTotal]           = useState(0);
  const [visible, setVisible]       = useState(0);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setVisible(0);
    try {
      const res = await api.get(`/scrape/history?page=${page}&per_page=15`);
      const r   = res.data.data;
      setSessions(r.data || []);
      setCurrentPage(r.current_page);
      setLastPage(r.last_page);
      setTotal(r.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Staggered card reveal
  useEffect(() => {
    if (!loading && sessions.length > 0) {
      setVisible(0);
      let i = 0;
      const iv = setInterval(() => { i++; setVisible(i); if (i >= sessions.length) clearInterval(iv); }, 60);
      return () => clearInterval(iv);
    }
  }, [loading, sessions]);

  useEffect(() => { fetchHistory(currentPage); }, [currentPage]);

  const goPage = (p) => { if (p >= 1 && p <= lastPage) setCurrentPage(p); };

  // Click on session → go to SearchResult with session info
  const handleSessionClick = (session) => {
    navigate('/admin/search/result/data', {
      state: {
        sessions: [{ sessionId: session.id, term: session.keyword, status: session.status }]
      }
    });
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-300 p-3 md:p-6 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-[#111] p-5 rounded-2xl border border-gray-800 gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Search History</h1>
          <p className="text-xs text-gray-500 mt-1">
            {total} total searches — click any to view results
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/search/create')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Search size={15} /> New Search
        </button>
      </div>

      {/* Sessions list */}
      <div className="space-y-3">
        {loading
          ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          : sessions.length === 0
            ? (
              <div className="text-center py-20 text-gray-700">
                <Database size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No searches yet. Start your first extraction!</p>
                <button
                  onClick={() => navigate('/admin/search/create')}
                  className="mt-4 text-orange-400 hover:text-orange-300 text-sm underline"
                >
                  Start now →
                </button>
              </div>
            )
            : sessions.map((s, i) => (
              <div
                key={s.id}
                onClick={() => s.status === 'completed' && handleSessionClick(s)}
                className={`bg-[#111] border rounded-xl p-4 transition-all duration-500 ${
                  i < visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                } ${
                  s.status === 'completed'
                    ? 'border-gray-800 hover:border-orange-500/50 hover:bg-[#161616] cursor-pointer group'
                    : 'border-gray-800/50 opacity-60 cursor-not-allowed'
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left — search info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors truncate">
                        "{s.keyword}"
                      </span>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={10} /> {s.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Database size={10} />
                        <span className="text-orange-400 font-bold">{s.result_count}</span>
                        <span>/ {s.requested_limit} results</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={10} /> {formatDate(s.created_at)}
                      </span>
                    </div>

                    {s.error_message && (
                      <p className="text-[10px] text-red-400/70 mt-1.5 line-clamp-1">
                        ✗ {s.error_message}
                      </p>
                    )}
                  </div>

                  {/* Right — arrow */}
                  {s.status === 'completed' && (
                    <div className="shrink-0 flex items-center self-center">
                      <ArrowRight size={18} className="text-gray-700 group-hover:text-orange-400 transition-all group-hover:translate-x-1" />
                    </div>
                  )}
                </div>
              </div>
            ))
        }
      </div>

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="mt-6 flex items-center justify-between bg-[#0d0d0d] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-600">
            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{lastPage}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 hover:text-orange-400 disabled:opacity-20 transition-all">
              <ChevronLeft size={16} />
            </button>
            {[...Array(lastPage)].map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === lastPage || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <button key={p} onClick={() => goPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                      currentPage === p ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}>{p}</button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-gray-700 px-1">…</span>;
              return null;
            })}
            <button onClick={() => goPage(currentPage + 1)} disabled={currentPage === lastPage}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 hover:text-orange-400 disabled:opacity-20 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}