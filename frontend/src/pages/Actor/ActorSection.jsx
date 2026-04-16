import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Navigate import kiya

const actorsData = [
  {
    id: 1,
    title: 'Google Maps Scraper',
    // username: 'compass/crawler-google-places',
    description: 'Extract data from thousands of Google Maps locations and businesses, including reviews, reviewer details, images, contact...',
    icon: '📍',
    // author: 'Compass',
    // rating: '4.8',
    // reviews: '1,159',
    // users: '358K',
    url: '/login'
  },
  // {
  //   id: 2,
  //   title: 'TikTok Scraper',
  //   username: 'clockworks/tiktok-scraper',
  //   description: 'Extract data from TikTok videos, hashtags, and users. Use URLs or search queries to scrape TikTok profiles, hashtags, posts,...',
  //   icon: '🎵',
  //   author: 'Clockworks',
  //   rating: '4.7',
  //   reviews: '253',
  //   users: '159K',
  //   url: '/tiktok-scraper'
  // },
  // {
  //   id: 3,
  //   title: 'Website Content Crawler',
  //   username: 'apify/website-content-crawler',
  //   description: 'Crawl websites and extract text content to feed AI models, LLM applications, vector databases, or RAG pipelines. The Actor...',
  //   icon: '🕸️',
  //   author: 'Apify',
  //   rating: '4.5',
  //   reviews: '186',
  //   users: '117K',
  //   url: '/crawler'
  // },
  // {
  //   id: 4,
  //   title: 'Google Search Results Scr...',
  //   username: 'apify/google-search-scraper',
  //   description: 'Scrape Google Search Engine Results Pages (SERPs). Select the country or language and extract organic and paid...',
  //   icon: '🔍',
  //   author: 'Apify',
  //   rating: '4.9',
  //   reviews: '123',
  //   users: '111K',
  //   url: '/search-scraper'
  // }
];

const ActorGrid = () => {
  const navigate = useNavigate(); // 2. Hook initialize kiya

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans bg-gray-50/30 pt-20">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">All Actors</h2>
        </div>
        <button
          onClick={() => navigate('/store')} // Store page ke liye navigate
          className="flex items-center text-[15px] font-bold text-gray-900 hover:opacity-70 transition-opacity"
        >
          View all
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actorsData.map((actor) => (
          <div
            key={actor.id}
            onClick={() => navigate(actor.url)} // 3. Click par navigate function call kiya
            className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
          >
            {/* Card Top: Icon & Title */}
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                {actor.icon}
              </div>
              <div className="ml-4 overflow-hidden">
                <h3 className="font-bold text-[#111827] text-[16px] leading-tight truncate group-hover:text-blue-600 transition-colors">
                  {actor.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                  {actor.username}
                </p>
              </div>
            </div>

            {/* Card Body: Description */}
            <p className="text-[13.5px] text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {actor.description}
            </p>

            {/* Card Footer: Metadata */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500 font-medium">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] mr-2">
                  👤
                </div>
                <span className="text-gray-700">{actor.author}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <span className="text-orange-400 mr-0.5 text-sm">★</span>
                  <span>{actor.rating}</span>
                  <span className="text-gray-300 ml-0.5">({actor.reviews})</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1 opacity-70">👥</span>
                  <span>{actor.users}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActorGrid;