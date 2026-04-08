import React from 'react';


const Dashboard = () => {
  // Dummy arrays for mapping
  const recentlyViewed = [
    { id: 1, title: "compass/google-maps-extractor", time: "Started at 2026-04-08 11:20:34" },
    { id: 2, title: "Google Maps Extractor", time: "compass/google-maps-extractor" }
  ];

  const suggestedActors = [
    { id: 1, name: "Google Maps Scraper", dev: "Compass", rating: "4.7 (1,109)", users: "347K" },
    { id: 2, name: "Enrich Google Maps D...", dev: "Compass", rating: "3.1 (9)", users: "1.6K" },
    { id: 3, name: "Google Maps Email...", dev: "Lukáš Křivka", rating: "4.3 (172)", users: "65K" },
    { id: 4, name: "Google Maps Scraper...", dev: "Caleb David", rating: "4.1 (94)", users: "12K" }
  ];

  return (

    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] p-6 font-sans">

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="bg-[#2a2a2a] hover:bg-[#3a3a3a] px-4 py-2 rounded-md flex items-center gap-2 transition border border-gray-700">
          Create <span className="text-xs">▼</span>
        </button>
      </header>

      {/* Recently Viewed */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Recently viewed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlyViewed.map(item => (
            <div key={item.id} className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 flex items-center gap-3 cursor-pointer hover:border-gray-600">
              <div className="w-10 h-10 bg-[#252525] flex items-center justify-center rounded">📍</div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Actors */}
      {/* <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Suggested Actors for you</h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <button className="hover:underline">Hide</button>
            <button className="hover:underline">View all</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestedActors.map(actor => (
            <div key={actor.id} className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 flex flex-col justify-between hover:bg-[#252525] transition">
              <div>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 text-xl">📍</div>
                <h3 className="font-bold text-base mb-1">{actor.name}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">compass/crawler-google-p...</p>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  Extract data from thousands of Google Maps locations and businesses, including reviews, reviewer details...
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-3 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>{actor.dev}</span>
                </div>
                <div className="flex gap-3">
                  <span>⭐ {actor.rating}</span>
                  <span>👥 {actor.users}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Actor Runs Table */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Actor runs</h2>
          <button className="text-sm text-blue-400 hover:underline">View all runs</button>
        </div>

        <div className="border-b border-gray-800 mb-4 flex gap-6 text-sm">
          <button className="pb-2 border-b-2 border-blue-500 text-blue-500 font-medium">Recent</button>
          <button className="pb-2 text-gray-500 hover:text-gray-300">Scheduled</button>
        </div>

        <div className="overflow-x-auto bg-[#1e1e1e] rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#181818] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Results</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, status: "Success", actor: "Google Maps Scraper", task: "Extract-NY-Hotels", results: "1,240", started: "2026-04-08 10:15", duration: "12m 30s" },
                { id: 2, status: "Running", actor: "Instagram Crawler", task: "Hashtag-Analysis", results: "450", started: "2026-04-08 11:05", duration: "05m 12s" },
                { id: 3, status: "Failed", actor: "Amazon Price Tracker", task: "Electronics-Daily", results: "0", started: "2026-04-07 22:40", duration: "01m 05s" }
              ].map((run) => (
                <tr key={run.id} className="border-t border-gray-800 hover:bg-[#252525] transition-colors">
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${run.status === 'Success' ? 'bg-green-900/30 text-green-500' :
                        run.status === 'Running' ? 'bg-blue-900/30 text-blue-500' :
                          'bg-red-900/30 text-red-500'
                      }`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-200">{run.actor}</td>
                  <td className="px-4 py-4 text-gray-400">{run.task}</td>
                  <td className="px-4 py-4 text-gray-300 font-mono">{run.results}</td>
                  <td className="px-4 py-4 text-gray-500">{run.started}</td>
                  <td className="px-4 py-4 text-gray-500">{run.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-500 transition">
        💬
      </div>
    </div>
  );
};

export default Dashboard;