import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
      { name: "Search Data", path: "/admin/search/data" },
    ],
  },
  {
    name: "Runs",
    icon: "▶",
    children: [
      { name: "Search History", path: "/admin/search/history" },
    ],
  },
  {
    name: "Accounts",
    icon: "👤",
    children: [
      { name: "Profile Information", path: "/admin/accounts/profile" },
      { name: "Change Password", path: "/admin/accounts/change-password" },
    ],
  },
   {
    name: "Subscriptions",
    icon: "👤",
    children: [
      { name: "User Subscription", path: "/admin/subscription" },
     
    ],
  },
];

export default function MainSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = (i) => {
    setOpenMenus((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };

  const isActive = (path) => location.pathname === path;

  // 🔥 Auto open submenu if route matches
  const isChildActive = (children) => {
    return children?.some((child) =>
      location.pathname.startsWith(child.path)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
        {menuData.map((menu, i) => {
          const open = openMenus[i] || isChildActive(menu.children);

          return (
            <div key={i}>
              {/* Main Menu */}
              <div
                onClick={() => {
                  if (menu.children) {
                    toggleMenu(i);
                  } else if (menu.path) {
                    navigate(menu.path);
                  }
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer
                transition-all duration-200 group
                ${
                  isActive(menu.path) || isChildActive(menu.children)
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
                      open ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {/* Submenu */}
              {menu.children && open && !collapsed && (
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
          );
        })}
      </div>

      {/* Bottom */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl text-sm">
            <button
              onClick={handleLogout}
              className="mt-2 w-full bg-indigo-500 py-1 rounded-md hover:bg-indigo-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}