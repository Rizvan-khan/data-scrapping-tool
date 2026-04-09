import { useState } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";


const menuData = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: "🏠",
  },
  {
    name: "Actors",
    icon: "⚡",
    children: [
      { name: "Search Data", path: "search/data" },
      // { name: "Create Actor", path: "/admin/actors/create" },
    ],
  },
  {
    name: "Runs",
    icon: "▶️",
    children: [
      // { name: "All Runs", path: "/admin/runs" },
      { name: "History", path: "/admin/runs/history" },
    ],
  },
];

export default function MainSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Token delete karo
    localStorage.removeItem("token");
    
    // 2. User ko login page par bhej do
    navigate("/login");
  };

  const toggleMenu = (i) => {
    setOpenMenus((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`h-screen bg-slate-950 text-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"} shadow-xl flex flex-col`}
    >
      {/* Top */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && <h1 className="text-lg font-semibold">Rizvan</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xl hover:scale-110 transition"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuData.map((menu, i) => (
          <div key={i}>
            
            {/* Main Menu */}
            <div
              onClick={() => menu.children && toggleMenu(i)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer
              transition-all duration-200 group
              ${
                isActive(menu.path)
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                  : "hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{menu.icon}</span>
                {!collapsed && <span>{menu.name}</span>}
              </div>

              {menu.children && !collapsed && (
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    openMenus[i] ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {/* Submenu */}
            {menu.children && openMenus[i] && !collapsed && (
              <div className="ml-8 mt-1 space-y-1 border-l border-slate-700 pl-3">
                {menu.children.map((sub, j) => (
                  <Link
                    key={j}
                    to={sub.path}
                    className={`block px-2 py-1 rounded-md text-sm transition
                    ${
                      isActive(sub.path)
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Card */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl text-sm">
            {/* <p className="text-slate-400">RAM Usage</p>
            <p className="font-semibold">0 MB / 8 GB</p> */}
            <button onClick={handleLogout} className="mt-2 w-full bg-indigo-500 py-1 rounded-md hover:bg-indigo-600 transition">
              Sing Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}