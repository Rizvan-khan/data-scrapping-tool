import React from 'react'
import MainSidebar from '../common/Sidebar';
import { Outlet } from 'react-router-dom';

function MainPanel() {
  return (
    // Flexbox use karke Sidebar aur Content ko side-by-side rakha hai
    <div className="flex min-h-screen bg-[#121212]">
      
      {/* 1. Sidebar: Ye hamesha fixed rahega */}
      <MainSidebar />
      
      {/* 2. Main Content Area: Yahan saare pages render honge */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* <Outlet /> hi wo jagah hai jahan Dashboard dikhayi dega */}
          <Outlet /> 
          
        </main>
      </div>
    </div>
  );
}

export default MainPanel;