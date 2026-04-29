import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Download, ChevronDown, FileSpreadsheet, FileText, File,
  Mail, Phone, MapPin, Globe, Star, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/api/results?page=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const resultObj = res.data.data;
      setData(resultObj.data || []);
      setCurrentPage(resultObj.current_page);
      setLastPage(resultObj.last_page);
      setTotalResults(resultObj.total);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ScrapedData");
    XLSX.writeFile(wb, `Scrape_Results_Page_${currentPage}.xlsx`);
    setExportOpen(false);
  };

  // Export CSV
  const exportToCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(val =>
        `"${String(val ?? '').replace(/"/g, '""')}"`
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scrape_Results_Page_${currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Export PDF
 const exportToPDF = () => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text(`Scrape Results — Page ${currentPage} of ${lastPage} (Total: ${totalResults})`, 14, 15);

  const columns = data.length ? Object.keys(data[0]) : [];
  const rows = data.map(row => Object.values(row).map(val => val ?? ''));

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 22,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`Scrape_Results_Page_${currentPage}.pdf`);
  setExportOpen(false);
};

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-300">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <h2 className="text-xl font-medium animate-pulse">Fetching Premium Leads...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-300 p-2 md:p-6 font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-[#161616] p-5 rounded-xl border border-gray-800 shadow-xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Scraper Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded border border-orange-500/20">
              Total: {totalResults} Results
            </span>
            <span className="text-xs text-gray-500 italic">Page {currentPage} of {lastPage}</span>
          </div>
        </div>

        {/* Export Dropdown */}
        <div className="relative w-full md:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setExportOpen(prev => !prev)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-green-900/20 w-full md:w-auto justify-center"
          >
            <Download size={18} />
            Download
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${exportOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-green-600 hover:text-white transition-all"
              >
                <FileSpreadsheet size={16} className="text-green-400" />
                Excel (.xlsx)
              </button>
              <div className="border-t border-gray-800" />
              <button
                onClick={exportToCSV}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all"
              >
                <FileText size={16} className="text-blue-400" />
                CSV (.csv)
              </button>
              <div className="border-t border-gray-800" />
              <button
                onClick={exportToPDF}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-all"
              >
                <File size={16} className="text-red-400" />
                PDF (Print)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#111111] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[12px] uppercase tracking-wider bg-[#1a1a1a] border-b border-gray-800">
                <th className="p-4 text-center">#</th>
                <th className="p-4">Business Info</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Rating & Reviews</th>
                <th className="p-4">Location</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#161616] transition-all group">
                  <td className="p-4 text-center text-gray-600 font-mono">
                    {(currentPage - 1) * 20 + (index + 1)}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-100 text-base group-hover:text-orange-400 transition-colors">
                      {item.name || "Unknown Business"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
                      {item.category || "Business"}
                    </div>
                  </td>
                  <td className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <Phone size={14} className="text-gray-500" />
                      {item.phone || "No Phone"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm italic">
                      <Mail size={14} className="text-gray-500" />
                      <span className="truncate max-w-[150px]">{item.email || "No Email"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                      <Star size={16} fill="currentColor" />
                      {item.rating || "0"}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {item.review_count || 0} Reviews
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                      <span className="line-clamp-2">{item.address}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1 ml-6 uppercase font-bold">
                      {item.city}, {item.country}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.website && item.website !== "N/A" ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#222] hover:bg-blue-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-xs transition-all border border-gray-700"
                      >
                        <Globe size={14} /> Website
                      </a>
                    ) : (
                      <span className="text-gray-700 text-xs italic">No Link</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-gray-800">
        <div className="text-sm text-gray-500">
          Showing <span className="text-white font-bold">{(currentPage - 1) * 20 + 1}</span> to{' '}
          <span className="text-white font-bold">{Math.min(currentPage * 20, totalResults)}</span> of{' '}
          <span className="text-orange-500 font-bold">{totalResults}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg bg-[#1a1a1a] border border-gray-700 hover:bg-orange-500 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1 hidden md:flex">
            {[...Array(lastPage)].map((_, i) => {
              const pageNum = i + 1;
              if (pageNum === 1 || pageNum === lastPage || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${
                      currentPage === pageNum
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-900/20'
                        : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-2 text-gray-600">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="p-2.5 rounded-lg bg-[#1a1a1a] border border-gray-700 hover:bg-orange-500 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataView;