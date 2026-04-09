import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Download, ExternalLink, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const DataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch Data with Page Parameter
  const fetchData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/api/results?page=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      // Laravel Pagination structure: res.data.data.data
      const resultObj = res.data.data;
      setData(resultObj.data || []);
      setCurrentPage(resultObj.current_page);
      setLastPage(resultObj.last_page);
      setTotalResults(resultObj.total);
    } catch (err) {
      console.error("Error fetching data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-gray-300">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <h2 className="text-xl font-medium italic">Loading results...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-gray-300 p-4 md:p-6">
      
      {/* Header with Total Count */}
      <div className="flex justify-between items-center mb-6 bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
        <div>
          <h2 className="text-sm font-medium">Total Places Found: <span className="text-orange-500">{totalResults}</span></h2>
          <p className="text-xs text-gray-500">Page {currentPage} of {lastPage}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-all">
          <Download size={16} /> Export Page
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-t-lg border border-gray-800 bg-[#141414]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800 bg-[#1a1a1a]">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Place Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Address</th>
              <th className="p-4">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="p-4 text-gray-600 text-center">{(currentPage - 1) * 20 + (index + 1)}</td>
                <td className="p-4 font-semibold text-gray-200">{item.name || "N/A"}</td>
                <td className="p-4 text-blue-400">{item.phone}</td>
                <td className="p-4 text-orange-400 font-bold">{item.rating} ⭐</td>
                <td className="p-4 text-gray-400 max-w-xs truncate" title={item.address}>{item.address}</td>
                <td className="p-4">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Link</a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Footer --- */}
      <div className="flex items-center justify-between bg-[#1a1a1a] p-4 border-x border-b border-gray-800 rounded-b-lg">
        <div className="text-sm text-gray-500">
          Showing <span className="text-gray-200">{(currentPage - 1) * 20 + 1}</span> to <span className="text-gray-200">{Math.min(currentPage * 20, totalResults)}</span> of {totalResults}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded bg-[#2a2a2a] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page Numbers (Optional: Simple dynamic dots) */}
          <div className="flex gap-1">
             {[...Array(lastPage)].map((_, i) => {
               const pageNum = i + 1;
               // Sirf current page ke aas paas ke numbers dikhane ke liye
               if (pageNum === 1 || pageNum === lastPage || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                 return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${currentPage === pageNum ? 'bg-orange-500 text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]'}`}
                    >
                      {pageNum}
                    </button>
                 );
               }
               return null;
             })}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="p-2 rounded bg-[#2a2a2a] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataView;