import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, ExternalLink, Table as TableIcon, FileJson, MoreHorizontal } from 'lucide-react';

const dummyData = [
  { id: 1, title: "Softech Global Services", city: "Churai Dalpatpur", state: "Uttar Pradesh", country: "IN", website: "https://softech.vercel.app", reviews: 0, score: null },
  { id: 2, title: "Elite Unison Private Limited", city: "Deoranian", state: "Uttar Pradesh", country: "IN", website: "https://eliteunison.com", reviews: 20, score: 5 },
  { id: 3, title: "Vikas Computer Services", city: "Ratnanandpur", state: "Uttar Pradesh", country: "IN", website: "", reviews: 3, score: 5 },
];

const DataView = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Excel Download Function
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ScrapedData");
    XLSX.writeFile(workbook, "Scraped_Data.xlsx");
  };

  const tabs = ['Overview', 'Contact info', 'Rating', 'Social media', 'Lead enrichment'];

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-gray-300 p-4 md:p-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
            <div className="bg-green-900/20 text-green-500 p-2 rounded text-xs font-bold border border-green-900">SUCCEEDED</div>
            <h2 className="text-sm font-medium">Scraping finished. 100 places found.</h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={downloadExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-all">
            <Download size={16} /> Export Excel
          </button>
          <button className="bg-[#2a2a2a] p-2 rounded hover:bg-[#333333]"><Share2 size={16} /></button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-800 mb-4 gap-4">
        <div className="flex overflow-x-auto no-scrollbar gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
            <button className="flex items-center gap-1 bg-[#1e1e1e] px-3 py-1 rounded text-xs border border-gray-700"><TableIcon size={14}/> Table</button>
            <button className="flex items-center gap-1 text-gray-500 px-3 py-1 text-xs"><FileJson size={14}/> JSON</button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#141414]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800 bg-[#1a1a1a]">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Image</th>
              <th className="p-4">Place name</th>
              <th className="p-4">Score</th>
              <th className="p-4">Reviews</th>
              <th className="p-4">City</th>
              <th className="p-4">State</th>
              <th className="p-4">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {dummyData.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#1e1e1e] transition-colors group">
                <td className="p-4 text-gray-600">{index + 1}</td>
                <td className="p-4">
                  <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center overflow-hidden border border-gray-700">
                    <img src={`https://picsum.photos/seed/${item.id}/100/60`} alt="place" className="object-cover w-full h-full opacity-60 group-hover:opacity-100" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-gray-200">{item.title}</div>
                  <MoreHorizontal size={14} className="mt-1 text-gray-600 cursor-pointer" />
                </td>
                <td className="p-4 text-orange-400 font-bold">{item.score || '-'}</td>
                <td className="p-4 text-gray-400">{item.reviews || 'null'}</td>
                <td className="p-4">{item.city}</td>
                <td className="p-4 whitespace-nowrap">{item.state}</td>
                <td className="p-4">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noreferrer" className="text-blue-500 flex items-center gap-1 hover:underline">
                      Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-700 italic text-xs">undefined</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataView;

const Share2 = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);