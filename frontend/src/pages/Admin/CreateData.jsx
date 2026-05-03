import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, List, Plus, X, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// ─── API helper ───────────────────────────────────────────────
const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Animated log line ────────────────────────────────────────
function LogLine({ text, type = 'info', delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const colors = {
    info:    'text-gray-400',
    success: 'text-emerald-400',
    warn:    'text-amber-400',
    error:   'text-red-400',
  };

  return (
    <div
      className={`flex items-start gap-2 text-xs font-mono transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${colors[type]}`}
    >
      <span className="text-gray-600 shrink-0 mt-0.5">›</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500 font-mono">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function CreateData() {
  const navigate = useNavigate();

  // Form state
  const [searchTerms, setSearchTerms] = useState(['software company']);
  const [location, setLocation]       = useState('Bareilly Uttar Pradesh');
  const [limit, setLimit]             = useState(10);

  // Job state
  const [phase, setPhase]             = useState('idle'); // idle | running | done | error
  const [sessions, setSessions]       = useState([]);     // { term, sessionId, status, count, requested }
  const [logs, setLogs]               = useState([]);
  const [errorMsg, setErrorMsg]       = useState('');
  const pollerRef                     = useRef(null);
  const logBoxRef                     = useRef(null);

  // Auto-scroll log box
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup poller on unmount
  useEffect(() => () => clearInterval(pollerRef.current), []);

  const addLog = (text, type = 'info') =>
    setLogs(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);

  // ── Search term helpers ──────────────────────────────────────
  const addField    = () => setSearchTerms(p => [...p, '']);
  const removeField = (i) => setSearchTerms(p => p.filter((_, idx) => idx !== i));
  const editField   = (i, v) => setSearchTerms(p => { const n = [...p]; n[i] = v; return n; });

  // ── Start scraping ───────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    const terms = searchTerms.map(t => t.trim()).filter(Boolean);
    if (!terms.length || !location.trim()) return;

    setPhase('running');
    setLogs([]);
    setSessions([]);
    setErrorMsg('');

    addLog(`Starting ${terms.length} search job(s)…`, 'info');
    addLog(`Location: ${location}`, 'info');
    addLog(`Limit per search: ${limit}`, 'info');

    // Fire all jobs simultaneously
    const newSessions = [];
    for (const term of terms) {
      try {
        addLog(`Queuing: "${term}"`, 'info');
        const res = await api.post('/scrape', {
          keyword:  term,
          location: location,
          limit:    Number(limit),
        });
        const sid = res.data.session_id;
        newSessions.push({ term, sessionId: sid, status: 'pending', count: 0, requested: Number(limit) });
        addLog(`Session #${sid} created for "${term}"`, 'success');
      } catch (err) {
        addLog(`Failed to queue "${term}": ${err.response?.data?.message || err.message}`, 'error');
      }
    }

    setSessions(newSessions);

    if (!newSessions.length) {
      setPhase('error');
      setErrorMsg('No sessions were created.');
      return;
    }

    addLog('Workers started — polling for results…', 'info');

    // Poll every 4 seconds
    pollerRef.current = setInterval(async () => {
      setSessions(prev => {
        // fire async updates outside setState
        return prev;
      });

      const updated = await Promise.all(
        newSessions.map(async (s) => {
          if (s.status === 'completed' || s.status === 'failed') return s;
          try {
            const r = await api.get(`/scrape/sessions/${s.sessionId}/status`);
            const d = r.data.data;
            return { ...s, status: d.status, count: d.result_count || 0 };
          } catch {
            return s;
          }
        })
      );

      setSessions(updated);

      // Log changes
      updated.forEach(s => {
        if (s.status === 'completed') addLog(`✓ "${s.term}" — ${s.count} results saved`, 'success');
        if (s.status === 'processing') addLog(`⟳ "${s.term}" — scraping…`, 'info');
        if (s.status === 'failed')     addLog(`✗ "${s.term}" — failed`, 'error');
      });

      const allDone = updated.every(s => s.status === 'completed' || s.status === 'failed');
      if (allDone) {
        clearInterval(pollerRef.current);
        const anySuccess = updated.some(s => s.status === 'completed');
        setPhase(anySuccess ? 'done' : 'error');
        if (anySuccess) {
          addLog('All jobs complete! Redirecting…', 'success');
          setTimeout(() => navigate('/admin/search/result/data', {
            state: { sessions: updated }
          }), 1800);
        }
      }
    }, 4000);
  };

  const allDone     = sessions.length > 0 && sessions.every(s => s.status === 'completed' || s.status === 'failed');
  const totalSaved  = sessions.reduce((acc, s) => acc + s.count, 0);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="max-w-3xl p-6 bg-[#0a0a0a] text-gray-300 min-h-screen">

      {/* ── RUNNING OVERLAY ─────────────────────────────────── */}
      {phase === 'running' || phase === 'done' ? (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            {phase === 'done'
              ? <CheckCircle2 size={24} className="text-emerald-400" />
              : <Loader2 size={24} className="text-orange-400 animate-spin" />
            }
            <div>
              <h2 className="text-white font-bold text-lg">
                {phase === 'done' ? 'Extraction Complete' : 'Extracting Data…'}
              </h2>
              <p className="text-xs text-gray-500">
                {phase === 'done'
                  ? `${totalSaved} leads saved successfully`
                  : 'Google Maps se data aa raha hai — please wait'}
              </p>
            </div>
          </div>

          {/* Per-session progress */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5 space-y-4">
            {sessions.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-medium truncate max-w-xs">
                    "{s.term}"
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                    s.status === 'completed' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                    s.status === 'failed'    ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                    s.status === 'processing'? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                                              'text-gray-500 border-gray-700 bg-gray-800/50'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <ProgressBar value={s.count} max={s.requested} label={`Session #${s.sessionId}`} />
              </div>
            ))}
          </div>

          {/* Live log terminal */}
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 bg-[#111]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-xs text-gray-600 ml-2 font-mono">scraper.log</span>
            </div>
            <div
              ref={logBoxRef}
              className="p-4 space-y-1.5 max-h-52 overflow-y-auto scrollbar-none"
            >
              {logs.map((l, i) => (
                <LogLine key={l.id} text={l.text} type={l.type} delay={i * 80} />
              ))}
              {phase === 'running' && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mt-1">
                  <span className="animate-pulse">█</span>
                </div>
              )}
            </div>
          </div>

          {/* Done CTA */}
          {phase === 'done' && (
            <button
              onClick={() => navigate('/admin/search/result/data', { state: { sessions } })}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              View Results →
            </button>
          )}
        </div>

      ) : (
        /* ── FORM ─────────────────────────────────────────── */
        <form onSubmit={handleSearch} className="space-y-8">

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Search Terms */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-semibold text-white">
              <Search size={16} className="text-orange-400" /> Search Terms
            </label>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5 space-y-3">
              {searchTerms.map((term, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-600 font-mono text-xs w-5 text-right">{i + 1}</span>
                  <input
                    type="text"
                    value={term}
                    onChange={e => editField(i, e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-700"
                    placeholder="e.g. software company"
                  />
                  {searchTerms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="p-2 hover:bg-red-900/20 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 mt-1 transition-colors"
              >
                <Plus size={15} /> Add another keyword
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-semibold text-white">
              <MapPin size={16} className="text-red-400" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-700"
              placeholder="City, Country"
            />
          </div>

          {/* Limit */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-semibold text-white">
              <List size={16} className="text-blue-400" /> Number of Results
            </label>
            <input
              type="number"
              value={limit}
              min={1}
              max={500}
              onChange={e => setLimit(e.target.value)}
              className="w-40 bg-[#111] border border-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-900/20"
          >
            <Zap size={18} /> Start Extraction
          </button>
        </form>
      )}
    </div>
  );
}