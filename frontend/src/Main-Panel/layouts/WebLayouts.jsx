// Layout.jsx
import Navbar from './HomeLayout';
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function WebLayouts() {
  return (
    <>
      <Navbar />
      
      {/* Page Content */}
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}