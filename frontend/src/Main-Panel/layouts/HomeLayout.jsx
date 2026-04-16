import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-blue-600 cursor-pointer">
              LOGO
            </span>
          </div>

          {/* Desktop Search Area */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg py-2 px-4 outline-none transition-all"
              />
            </div>
          </div>

          {/* Desktop Links & Login */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Pricing
            </a>
           <button 
        onClick={() => navigate('/login')} 
        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Login
      </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-t`}>
        <div className="px-4 pt-2 pb-4 space-y-3">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-lg py-2 px-4 outline-none"
            />
          </div>
          <a href="#pricing" className="block text-gray-600 hover:text-blue-600 font-medium">
            Pricing
          </a>
          <button className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;