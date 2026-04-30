import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuConfig = [
  // {
  //   title: 'Solutions',
  //   submenu: [
  //     { name: 'E-commerce', path: '/solutions/ecommerce' },
  //     { name: 'Real Estate', path: '/solutions/real-estate' },
  //     { name: 'Marketing', path: '/solutions/marketing' },
  //     { name: 'AI Training', path: '/solutions/ai-training' },
  //   ],
  // },
  {
    title: 'Pricing',
    path: '/pricing',
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpander, setMobileExpander] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMobileSubmenu = (index) => {
    setMobileExpander(mobileExpander === index ? null : index);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-black"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              ></div>
              <span className="text-2xl font-bold text-[#111827]">
                Data
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {menuConfig.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (item.path) navigate(item.path);
                  }}
                  className={`flex items-center px-3 py-2 text-[15px] font-medium transition
                  ${
                    isActive(item.path)
                      ? 'text-black font-semibold'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.title}

                  {item.submenu && (
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {/* Dropdown */}
                {item.submenu && activeDropdown === index && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 shadow-xl rounded-xl py-2">
                    {item.submenu.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(sub.path)}
                        className={`block w-full text-left px-4 py-2 text-sm transition
                        ${
                          isActive(sub.path)
                            ? 'text-blue-600 bg-gray-50'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-5">
            <button className="text-[15px] font-medium text-gray-700 hover:text-black">
              Contact sales
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor">
                {isOpen ? (
                  <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-16 bg-white border-t transition-all duration-300 z-40
        ${isOpen ? 'h-screen opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col items-center pt-8 space-y-6 px-6">

          {menuConfig.map((item, index) => (
            <div key={index} className="w-full max-w-xs text-center">

              {/* Main */}
              <button
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    setIsOpen(false);
                  } else {
                    toggleMobileSubmenu(index);
                  }
                }}
                className="text-xl font-semibold text-gray-900 flex justify-center items-center gap-2 w-full"
              >
                {item.title}

                {item.submenu && (
                  <svg
                    className={`w-5 h-5 transition ${
                      mobileExpander === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                  >
                    <path strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Submenu */}
              {item.submenu && (
                <div
                  className={`overflow-hidden transition-all duration-300
                  ${mobileExpander === index ? 'max-h-60 mt-4' : 'max-h-0'}`}
                >
                  <div className="flex flex-col space-y-3 bg-gray-50 rounded-xl py-4">
                    {item.submenu.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          navigate(sub.path);
                          setIsOpen(false);
                        }}
                        className={`text-lg transition
                        ${
                          isActive(sub.path)
                            ? 'text-blue-600 font-semibold'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="w-full max-w-xs pt-6 border-t">
            <button className="w-full py-3 text-lg text-gray-700 hover:text-black">
              Contact sales
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;