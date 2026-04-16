import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuConfig = [
  // {
  //   title: 'Product',
  //   submenu: ['Actors', 'Scrapers', 'Platform', 'Integrations'],
  // },
  // {
  //   title: 'Solutions',
  //   submenu: ['E-commerce', 'Real Estate', 'Marketing', 'AI Training'],
  // },
  // {
  //   title: 'Developers',
  //   submenu: ['Documentation', 'API Reference', 'SDKs', 'Community'],
  // },
  // {
  //   title: 'Resources',
  //   submenu: ['Blog', 'Success Stories', 'Pricing Guide', 'Help Center'],
  // },
  { title: 'Pricing', path: '/pricing' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [activeDropdown, setActiveDropdown] = useState(null); // Desktop hover
  const [mobileExpander, setMobileExpander] = useState(null); // Mobile accordion
  const navigate = useNavigate();

  const toggleMobileSubmenu = (index) => {
    setMobileExpander(mobileExpander === index ? null : index);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 z-50 font-sans shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                <span className="text-2xl font-bold text-[#111827] tracking-tighter">Data</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {menuConfig.map((item, index) => (
              <div 
                key={index} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center px-3 py-2 text-[15px] font-medium text-gray-600 hover:text-black transition-colors">
                  {item.title}
                  {item.submenu && (
                    <svg className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                {item.submenu && activeDropdown === index && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50">
                    {item.submenu.map((sub, i) => (
                      <a key={i} href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{sub}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-5">
            <button className="text-[15px] font-medium text-gray-700 hover:text-black">Contact sales</button>
            {/* <button className="bg-[#1f2937] text-white px-5 py-2 rounded-lg font-semibold text-[14px] hover:bg-black transition-all">
              Go to Console
            </button> */}
          </div>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-700">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /> : <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth={2} />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content (Centered) */}
      <div className={`fixed inset-x-0 top-16 bg-white border-t border-gray-100 transition-all duration-300 ease-in-out z-40 overflow-y-auto ${isOpen ? 'h-[calc(100vh-64px)] opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-start pt-8 pb-12 space-y-6 px-6 text-center">
          
          {menuConfig.map((item, index) => (
            <div key={index} className="w-full max-w-xs">
              <button 
                onClick={() => toggleMobileSubmenu(index)}
                className="w-full text-xl font-semibold text-gray-900 flex justify-center items-center gap-2 group"
              >
                {item.title}
                {item.submenu && (
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${mobileExpander === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Mobile Submenu (Accordion) */}
              {item.submenu && (
                <div className={`overflow-hidden transition-all duration-300 ${mobileExpander === index ? 'max-h-60 mt-4' : 'max-h-0'}`}>
                  <div className="flex flex-col space-y-3 bg-gray-50 rounded-xl py-4">
                    {item.submenu.map((sub, i) => (
                      <a key={i} href="#" className="text-gray-600 text-lg hover:text-blue-600 transition-colors">
                        {sub}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Mobile Footer Buttons */}
          <div className="w-full max-w-xs pt-6 space-y-4 border-t border-gray-100">
            <button className="w-full py-3 text-lg font-medium text-gray-700 hover:text-black transition-colors">
              Contact sales
            </button>
            {/* <button className="w-full py-4 bg-[#1f2937] text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Go to Console
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;