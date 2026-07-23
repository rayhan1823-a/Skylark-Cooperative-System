import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
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
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "";

  const menu = [
    {
      title: "Dashboard",
      path: "/",
      icon: <FaHome />,
    },
    {
      title: "Members",
      path: "/members",
      icon: <FaUsers />,
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
    <aside className="w-72 min-h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800/80 shadow-2xl">
      {/* ================= Logo ================= */}
      <div className="p-6 border-b border-slate-800/80 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <img
          src="/logo.png"
          alt="Skylark Logo"
          className="w-20 h-20 mx-auto bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2 shadow-inner object-contain"
        />
        <h1 className="text-2xl font-black mt-3 tracking-tight text-white">Skylark CMS</h1>
        <p className="text-slate-400 text-xs font-semibold mt-1">Cooperative Management System</p>
      </div>

      {/* ================= Menu ================= */}
      <nav className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto">
        {menu.map((item) => {
          if (item.roles && !item.roles.includes(role)) {
            return null;
          }
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm group
                ${
                  active
                    ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1 border border-transparent hover:border-slate-700/40"
                }`}
            >
              <span className={`text-lg transition-colors duration-300 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* ================= Logout ================= */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent transition-all duration-300 py-3 rounded-2xl font-bold text-sm shadow-sm"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      {/* ================= Footer ================= */}
      <div className="text-center text-slate-500 text-[11px] py-4 border-t border-slate-800/60 font-medium bg-slate-950/60">
        <p className="text-slate-400">Skylark CMS Core</p>
        <p className="mt-0.5">Version 1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;