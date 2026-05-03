import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download, ChevronDown, FileSpreadsheet, FileText, File,
  Mail, Phone, MapPin, Globe, Star, ChevronLeft, ChevronRight,
  ExternalLink, Clock, History
} from 'lucide-react';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800/50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="p-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-800 rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
            {i < 3 && <div className="h-2.5 bg-gray-800/60 rounded animate-pulse" style={{ width: `${40 + i * 5}%` }} />}
          </div>
        </td>
      ))}
    </tr>
  );
}

// ─── Result Row ───────────────────────────────────────────────
function ResultRow({ item, index, visible }) {
  return (
    <tr
      className={`border-b border-gray-800/40 hover:bg-white/[0.02] transition-all duration-500 group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionDelay: `${(index % 20) * 40}ms` }}
    >
      <td className="p-4 text-center">
        <span className="text-gray-600 font-mono text-xs">{index + 1}</span>
      </td>
      <td className="p-4 max-w-[220px]">
        <div className="font-semibold text-gray-100 text-sm leading-snug group-hover:text-orange-400 transition-colors line-clamp-2">
          {item.name || '—'}
        </div>
        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">
          {item.category || 'Business'}
        </div>
        {item.link && item.link !== 'N/A' && (
          <a href={item.link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-orange-400 mt-1 transition-colors">
            <ExternalLink size={9} /> Maps
          </a>
        )}
      </td>
      <td className="p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Phone size={12} className="text-gray-600 shrink-0" />
            <span className={item.phone && item.phone !== 'N/A' ? 'text-blue-400' : 'text-gray-700 italic'}>
              {item.phone && item.phone !== 'N/A' ? item.phone : 'No phone'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Mail size={12} className="text-gray-600 shrink-0" />
            <span className={item.email && item.email !== 'Not Available' ? 'text-emerald-400' : 'text-gray-700 italic'}>
              {item.email && item.email !== 'Not Available' ? item.email : 'No email'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {item.facebook && (
              <a href={item.facebook} target="_blank" rel="noreferrer"
                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all">fb</a>
            )}
            {item.instagram && (
              <a href={item.instagram} target="_blank" rel="noreferrer"
                className="text-[10px] px-1.5 py-0.5 rounded bg-pink-900/30 text-pink-400 hover:bg-pink-600 hover:text-white transition-all">ig</a>
            )}
          </div>
        </div>
      </td>
      <td className="p-4">
        {item.rating > 0 ? (
          <div>
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star size={13} fill="currentColor" />
              {Number(item.rating).toFixed(1)}
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">{item.review_count || 0} reviews</div>
          </div>
        ) : <span className="text-gray-700 text-xs italic">No rating</span>}
      </td>
      <td className="p-4 max-w-[180px]">
        <div className="flex items-start gap-1.5 text-xs text-gray-400">
          <MapPin size={12} className="text-red-500/70 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{item.address || '—'}</span>
        </div>
        {(item.city || item.country) && (
          <div className="text-[10px] text-gray-600 mt-1 ml-4 font-mono">
            {[item.city, item.country].filter(Boolean).join(', ')}
          </div>
        )}
        {item.working_hours && (
          <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-1 ml-4">
            <Clock size={9} /> {item.working_hours.split('|')[0]}
          </div>
        )}
      </td>
      <td className="p-4">
        {item.website && item.website !== 'N/A' ? (
          <a href={item.website} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-orange-500 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs border border-gray-800 hover:border-orange-500 transition-all">
            <Globe size={12} /> Visit
          </a>
        ) : <span className="text-gray-700 text-xs">—</span>}
      </td>
    </tr>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function SearchResult() {
  const navigate    = useNavigate();
  const routeState  = useLocation().state; // { sessions: [...] } from CreateData

  const [session, setSession]       = useState(null);
  const [data, setData]             = useState([]);
  const [visibleRows, setVisibleRows] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]     = useState(1);
  const [total, setTotal]           = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef                 = useRef(null);

  // Get latest session ID — from route state OR fetch from API
  const getSessionId = async () => {
    // Agar CreateData se aaye toh session_id wahan se lo
    if (routeState?.sessions?.length) {
      const completed = routeState.sessions.find(s => s.status === 'completed');
      return completed?.sessionId || routeState.sessions[0]?.sessionId;
    }
    // Warna latest session fetch karo
    const res = await api.get('/scrape/history?per_page=1');
    return res.data.data?.data?.[0]?.id || null;
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    setVisibleRows(0);
    try {
      const sid = await getSessionId();
      if (!sid) { setLoading(false); return; }

      const res = await api.get(`/scrape/sessions/${sid}/results?page=${page}&per_page=20`);
      const r   = res.data;
      setSession(r.session);
      setData(r.data.data || []);
      setCurrentPage(r.data.current_page);
      setLastPage(r.data.last_page);
      setTotal(r.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gradual row reveal
  useEffect(() => {
    if (!loading && data.length > 0) {
      setVisibleRows(0);
      let i = 0;
      const iv = setInterval(() => { i++; setVisibleRows(i); if (i >= data.length) clearInterval(iv); }, 45);
      return () => clearInterval(iv);
    }
  }, [loading, data]);

  useEffect(() => { fetchData(currentPage); }, [currentPage]);

  // Outside click
  useEffect(() => {
    const h = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Exports ───────────────────────────────────────────────
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${session?.keyword || 'data'}.xlsx`);
    setExportOpen(false);
  };

  const exportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows    = data.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob    = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url; a.download = `leads_${session?.keyword || 'data'}.csv`; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const exportPDF = () => {
    const doc  = new jsPDF({ orientation: 'landscape' });
    const cols = ['#', 'Name', 'Phone', 'Email', 'Website', 'Address', 'Rating'];
    const rows = data.map((r, i) => [(currentPage - 1) * 20 + i + 1, r.name, r.phone, r.email, r.website, r.address, r.rating]);
    doc.setFontSize(11);
    doc.text(`${session?.keyword} — ${session?.location} (${total} results)`, 14, 14);
    autoTable(doc, {
      head: [cols], body: rows, startY: 20,
      styles: { fontSize: 7, cellPadding: 2.5 },
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`leads_${session?.keyword || 'data'}.pdf`);
    setExportOpen(false);
  };

  const goPage = (p) => { if (p >= 1 && p <= lastPage) setCurrentPage(p); };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-300 p-3 md:p-6 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 bg-[#111] p-5 rounded-2xl border border-gray-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {session ? `"${session.keyword}"` : 'Latest Results'}
          </h1>
          {session && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={11} /> {session.location}
              </span>
              <span className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                {total} results
              </span>
              <span className="text-xs text-gray-600">Page {currentPage}/{lastPage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* History button */}
          <button
            onClick={() => navigate('/admin/search/history')}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm border border-gray-800 transition-all"
          >
            <History size={15} /> History
          </button>

          {/* Export */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen(p => !p)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Download size={15} /> Export
              <ChevronDown size={13} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#161616] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                {[
                  { label: 'Excel (.xlsx)', icon: <FileSpreadsheet size={14} className="text-emerald-400" />, action: exportExcel, hover: 'hover:bg-emerald-700' },
                  { label: 'CSV (.csv)',    icon: <FileText size={14} className="text-blue-400" />,           action: exportCSV,   hover: 'hover:bg-blue-700' },
                  { label: 'PDF',           icon: <File size={14} className="text-red-400" />,                action: exportPDF,   hover: 'hover:bg-red-700' },
                ].map((opt, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="border-t border-gray-800" />}
                    <button onClick={opt.action}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white transition-all ${opt.hover}`}>
                      {opt.icon} {opt.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-800 bg-[#0d0d0d] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[11px] uppercase tracking-widest bg-[#111] border-b border-gray-800">
                <th className="p-4 text-center w-10">#</th>
                <th className="p-4">Business</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Location</th>
                <th className="p-4">Website</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                : data.length === 0
                  ? <tr><td colSpan={6} className="py-20 text-center text-gray-700 text-sm">No results found.</td></tr>
                  : data.map((item, i) => (
                    <ResultRow key={item.id} item={item} index={(currentPage - 1) * 20 + i} visible={i < visibleRows} />
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d0d0d] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-600">
            Showing <span className="text-white">{(currentPage - 1) * 20 + 1}</span>
            {' – '}
            <span className="text-white">{Math.min(currentPage * 20, total)}</span>
            {' of '}
            <span className="text-orange-400 font-bold">{total.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 hover:text-orange-400 disabled:opacity-20 transition-all">
              <ChevronLeft size={18} />
            </button>
            {[...Array(lastPage)].map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === lastPage || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <button key={p} onClick={() => goPage(p)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                      currentPage === p ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}>{p}</button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-gray-700 px-1">…</span>;
              return null;
            })}
            <button onClick={() => goPage(currentPage + 1)} disabled={currentPage === lastPage}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 hover:text-orange-400 disabled:opacity-20 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}