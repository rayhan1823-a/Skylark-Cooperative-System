import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  Bell,
  CalendarDays,
  Clock,
  LogOut,
  UserCircle2,
  Menu,
  X
} from "lucide-react";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // লোকেশন পরিবর্তন হলে মোবাইল সাইডবার স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 relative overflow-x-hidden">
      
      {/* =========================
          MOBILE OVERLAY (Background shadow when mobile menu is open)
      ========================= */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        />
      )}

      {/* =========================
          SIDEBAR (Responsive for Mobile & Desktop)
      ========================= */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform 
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        flex-shrink-0
      `}>
        <Sidebar />
      </div>

      {/* =========================
          MAIN AREA
      ========================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* =========================
            HEADER
        ========================= */}
        <header className="bg-white shadow-md border-b sticky top-0 z-30">
          <div className="flex justify-between items-center px-4 lg:px-8 py-4">
            
            {/* Left */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle Button */}
              <button 
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
                aria-label="Toggle Menu"
              >
                {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-blue-700 truncate">
                  Skylark Cooperative Society
                </h1>
                <p className="text-gray-500 text-xs lg:text-sm hidden sm:block">
                  Digital Cooperative Management System
                </p>
              </div>
            </div>

            {/* Center */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <CalendarDays
                  size={20}
                  className="text-blue-600"
                />
                <span className="text-gray-700 font-medium">
                  {currentTime.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Clock
                  size={20}
                  className="text-green-600"
                />
                <span className="font-semibold text-gray-700">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Notification */}
              <button className="relative hover:scale-110 duration-300">
                <Bell
                  size={22}
                  className="text-gray-700 lg:w-6 lg:h-6"
                />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 lg:gap-3 focus:outline-none"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-700 text-white flex items-center justify-center text-lg lg:text-xl font-bold">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                  <div className="text-left hidden md:block">
                    <h3 className="font-semibold text-sm lg:text-base">
                      {user?.name || "Administrator"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {user?.role || "SUPER_ADMIN"}
                    </p>
                  </div>
                </button>
                {
                  showMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border overflow-hidden z-50">
                      <div className="bg-blue-700 text-white p-4">
                        <div className="flex items-center gap-3">
                          <UserCircle2 size={45} />
                          <div>
                            <h3 className="font-bold">
                              {user?.name || "Administrator"}
                            </h3>
                            <p className="text-sm text-blue-100">
                              {user?.role || "SUPER_ADMIN"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-5 py-3 hover:bg-gray-100 transition block"
                      >
                        👤 My Profile
                      </button>
                      
                      {/* Change Password লিঙ্ক */}
                      <Link
                        to="/change-password"
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-5 py-3 hover:bg-gray-100 transition block text-gray-800"
                      >
                        🔑 Change Password
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;