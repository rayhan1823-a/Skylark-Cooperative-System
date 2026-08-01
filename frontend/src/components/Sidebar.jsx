import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserPlus,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaUniversity,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaExchangeAlt,
  FaMinusCircle,
  FaExclamationTriangle,
  FaUserShield,
  FaHome,
  FaBell,
  FaPiggyBank,
  FaUserSlash,
  FaImages,
  FaVideo,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Gallery dropdown toggle state (পেইজ রিলোড বা রাউট বদলালেও সাব-মেনু যেন ঠিক থাকে বা ডিফল্ট বন্ধ থাকে)
  const [isGalleryOpen, setIsGalleryOpen] = useState(
    location.pathname.startsWith("/photo-gallery") || location.pathname.startsWith("/video-gallery")
  );

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "";

  const menu = [
    {
      title: "Home",
      path: "/",
      icon: <FaHome />,
    },
    {
      title: "Notice",
      path: "/notice",
      icon: <FaBell />,
    },
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FaChartBar />,
    },
    {
      title: "Members",
      path: "/members",
      icon: <FaUsers />,
    },
    {
      title: "Exited Members",
      path: "/exited-members",
      icon: <FaUserSlash />,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "Users List",
      path: "/users-list",
      icon: <FaUserShield />,
      roles: ["SUPER_ADMIN"],
    },
    {
      title: "Add Member",
      path: "/add-member",
      icon: <FaUserPlus />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Deposits",
      path: "/deposits",
      icon: <FaMoneyBillWave />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Deposit Withdrawal",
      path: "/deposit-withdrawal",
      icon: <FaMinusCircle />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Payments",
      path: "/payments",
      icon: <FaHandHoldingUsd />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Loans",
      path: "/loans",
      icon: <FaUniversity />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Investment Management",
      path: "/investments",
      icon: <FaPiggyBank />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Fund Management",
      path: "/funds",
      icon: <FaExchangeAlt />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Penalty Management",
      path: "/penalties",
      icon: <FaExclamationTriangle />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
      roles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <FaCog />,
      roles: ["SUPER_ADMIN"],
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-72 h-screen md:h-screen flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* ================= Logo ================= */}
      <div className="p-5 sm:p-6 border-b border-slate-800/85 text-center bg-gradient-to-b from-slate-900 to-slate-950 flex-shrink-0">
        <img
          src="/logo.png"
          alt="Skylark Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2 shadow-inner object-contain"
        />
        <h1 className="text-xl sm:text-2xl font-black mt-2.5 tracking-tight text-white">Skylark CMS</h1>
        <p className="text-slate-400 text-[11px] sm:text-xs font-semibold mt-0.5">Cooperative Management System</p>
      </div>

      {/* ================= Menu (Scrollable for Android/Mobile views) ================= */}
      <nav className="flex-1 mt-2 px-3 space-y-1.5 overflow-y-auto custom-sidebar-scroll">
        {menu.map((item, index) => {
          if (item.roles && !item.roles.includes(role)) {
            return null;
          }
          const active = location.pathname === item.path;

          // Home এবং Notice এর রেন্ডারিং এর পর Gallery ড্রপডাউন ইনজেক্ট করা হচ্ছে
          const isNoticeItem = item.title === "Notice";

          return (
            <React.Fragment key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold text-sm group
                  ${
                    active
                      ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.01]"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent hover:border-slate-700/40"
                  }`}
              >
                <span className={`text-lg transition-colors duration-300 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.title}</span>
              </Link>

              {/* ✅ Notice মেনুর ঠিক পরেই Gallery ড্রপডাউন মেনু যুক্ত করা হলো */}
              {isNoticeItem && (
                <div className="space-y-1">
                  <button
                    onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 font-semibold text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent hover:border-slate-700/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-lg text-slate-400 group-hover:text-blue-400">
                        <FaImages />
                      </span>
                      <span className="tracking-wide">Gallery</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {isGalleryOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </button>

                  {/* Sub-menus (Photo Gallery & Video Gallery) */}
                  {isGalleryOpen && (
                    <div className="pl-6 space-y-1 my-1 border-l-2 border-blue-600/40 ml-4">
                      {/* Photo Gallery Link */}
                      <Link
                        to="/photo-gallery"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium text-xs
                          ${
                            location.pathname === "/photo-gallery"
                              ? "bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30"
                              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                      >
                        <FaImages className="text-sm text-blue-400" />
                        <span>Photo Gallery</span>
                      </Link>

                      {/* Video Gallery Link */}
                      <Link
                        to="/video-gallery"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium text-xs
                          ${
                            location.pathname === "/video-gallery"
                              ? "bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30"
                              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                      >
                        <FaVideo className="text-sm text-blue-400" />
                        <span>Video Gallery</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* ================= Logout ================= */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 flex-shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent transition-all duration-300 py-2.5 sm:py-3 rounded-2xl font-bold text-sm shadow-sm"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      {/* ================= Footer ================= */}
      <div className="text-center text-slate-500 text-[11px] py-3 border-t border-slate-800/60 font-medium bg-slate-950/60 flex-shrink-0">
        <p className="text-slate-400">Skylark CMS Core</p>
        <p className="mt-0.5">Version 1.0.0</p>
      </div>

      {/* Inline styles to ensure smooth scrolling on mobile web/android webviews */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8);
          border-radius: 10px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.8);
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;