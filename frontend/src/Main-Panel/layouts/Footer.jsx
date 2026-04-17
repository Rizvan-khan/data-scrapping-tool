import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Product',
      links: [' Store', 'Integrations', 'Proxy', 'MCP', 'Crawlee'],
    },
    {
      title: 'Support',
      links: ['Help & Support', 'Submit your ideas', 'Forum'],
    },
    {
      title: 'Developers',
      links: ['Documentation', 'Code templates', 'API reference', 'Get paid on Data Scrapper'],
    },
    {
      title: 'Spotlight',
      links: ['APIs', 'What is web scraping?', 'Best web scraping tools'],
    },
    {
      title: 'Consulting',
      links: ['Professional Services', ' Partners'],
    },
    {
      title: 'Company',
      links: ['About ', 'Contact us', 'Events', 'Blog'],
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-200 px-6 py-12 md:px-16">
      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left Branding Section (4 columns on desktop) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8  from-blue-500  rounded-sm italic font-bold text-black flex items-center justify-center">
              Logo
            </div>
            {/* <span className="font-bold text-xl tracking-tight">logo</span> */}
          </div>
          
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900">Socials</h5>
            <div className="flex gap-4 text-gray-600 text-xl">
              <i className="fab fa-linkedin hover:text-black cursor-pointer"></i>
              <i className="fab fa-twitter hover:text-black cursor-pointer"></i>
              <i className="fab fa-github hover:text-black cursor-pointer"></i>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900">Security</h5>
            <div className="flex gap-3">
              <div className="px-3 py-1 border border-blue-600 text-blue-600 text-xs font-bold rounded-full">GDPR</div>
              <div className="px-3 py-1 border border-blue-800 text-blue-800 text-xs font-bold rounded-full">SOC2</div>
            </div>
          </div>
        </div>

        {/* Right Links Section (8 columns on desktop, nested grid) */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h4 className="font-bold text-gray-900 text-sm md:text-base">{section.title}</h4>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li 
                    key={link}
                    onClick={() => navigate(`/${link.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors duration-200"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
};

export default Footer;