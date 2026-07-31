import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, DollarSign, Wallet, TrendingDown, Building, ArrowUpRight, PiggyBank, ArrowDownRight, LogOut, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import axios from "axios";

const API = "https://skylark-cooperative-system.onrender.com/api";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "";
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF";

  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    bankProfit: 0,
  });

  const [totalLoanGiven, setTotalLoanGiven] = useState(0);
  const [fundTransactions, setFundTransactions] = useState([]);
  const [totalDepositBalance, setTotalDepositBalance] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [totalPenaltyAmount, setTotalPenaltyAmount] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalRefundAmount, setTotalRefundAmount] = useState(0);
  
  const [depositChartData, setDepositChartData] = useState([]);
  const [dueChartData, setDueChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        let calculatedTotalMembers = 5;

        // ১. মেইন ড্যাশবোর্ড ডাটা ফেচ
        try {
          const dashRes = await axios.get(`${API}/dashboard`, config);
          if (dashRes.data && dashRes.data.success) {
            const data = dashRes.data.data;
            
            calculatedTotalMembers = data.totalMembers || 5;
            setStats(prev => ({
              ...prev,
              totalMembers: calculatedTotalMembers,
              activeMembers: data.activeMembers || calculatedTotalMembers,
              inactiveMembers: data.inactiveMembers || 0,
              bankProfit: data.totalProfit || 0,
            }));

            setTotalDepositBalance(data.totalDeposit || 0);
            setTotalWithdrawal(data.totalWithdrawal || 0);
            setTotalLoanGiven(data.totalLoan || 0);

            if (Array.isArray(data.recentTransactions)) {
              setFundTransactions(data.recentTransactions);
            }

            if (Array.isArray(data.monthlyDeposit)) {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const formattedDeposit = data.monthlyDeposit.map(item => {
                const mName = monthNames[(item._id?.month || item.month || 1) - 1];
                const yStr = String(item._id?.year || item.year || "").slice(-2);
                return {
                  month: `${mName} ${yStr}`,
                  amount: item.total || item.amount || 0
                };
              });
              setDepositChartData(formattedDeposit);
            }

            if (Array.isArray(data.monthlyDue)) {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const formattedDue = data.monthlyDue.map(item => {
                const mName = monthNames[(item.month || item._id?.month || 1) - 1];
                const yStr = String(item.year || item._id?.year || "").slice(-2);
                return {
                  month: `${mName} ${yStr}`,
                  amount: item.total || item.amount || 0
                };
              });
              setDueChartData(formattedDue);
            }
          }
        } catch (dashErr) {
          console.error("Error fetching main dashboard API:", dashErr);
        }

        // ২. মেম্বার রিপোর্ট ডাটা ফেচ
        try {
          const reportRes = await axios.get(`${API}/reports/members`, config);
          if (reportRes.data && reportRes.data.success) {
            const reportList = reportRes.data.report || [];
            if (reportList.length > 0) {
              calculatedTotalMembers = reportList.length;
            }

            const calculatedTotalDep = reportList.reduce((sum, item) => sum + Number(item.totalDeposit || 0), 0);
            if (calculatedTotalDep > 0) {
              setTotalDepositBalance(calculatedTotalDep);
            }

            const calculatedTotalWithdrawal = reportList.reduce((sum, item) => sum + Number(item.totalWithdrawal || item.withdrawn || 0), 0);
            if (calculatedTotalWithdrawal > 0) {
              setTotalWithdrawal(calculatedTotalWithdrawal);
            }

            const activeCount = reportList.filter(item => item.status === "Active" || item.isActive).length;
            setStats(prev => ({
              ...prev,
              totalMembers: calculatedTotalMembers,
              activeMembers: activeCount > 0 ? activeCount : calculatedTotalMembers,
              inactiveMembers: calculatedTotalMembers - (activeCount > 0 ? activeCount : calculatedTotalMembers),
            }));
          }
        } catch (reportErr) {
          console.error("Error fetching reports API in dashboard:", reportErr);
        }

        // ৩. লোন ডাটা ফেচ
        try {
          const loanRes = await axios.get(`${API}/loans`, config);
          const loans = loanRes.data?.loans || loanRes.data?.data || loanRes.data || [];
          const totalLoan = loans.reduce((sum, l) => sum + Number(l.amount || l.loanAmount || 0), 0);
          if (totalLoan > 0) setTotalLoanGiven(totalLoan);
        } catch (err) {
          console.error("Error fetching loans API:", err);
        }

        // ৪. ফান্ড ও ট্রানজেকশন ফেচ
        try {
          const fundRes = await axios.get(`${API}/funds`, config);
          const fundData = fundRes.data;
          const transactions = fundData?.success && Array.isArray(fundData.transactions) ? fundData.transactions : (Array.isArray(fundData) ? fundData : []);
          setFundTransactions(transactions);

          const fundWithdrawal = transactions
            .filter(t => t && (t.type === "WITHDRAWAL" || t.category === "Withdrawal"))
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
          
          if (fundWithdrawal > 0) {
            setTotalWithdrawal(fundWithdrawal);
          }
        } catch (err) {
          console.error("Error fetching funds:", err);
        }

        // ৫. পেনাল্টি ডাটা ফেচ
        try {
          const penaltyRes = await axios.get(`${API}/penalties`, config);
          const penaltyData = penaltyRes.data?.penalties || penaltyRes.data?.data || penaltyRes.data || [];
          if (Array.isArray(penaltyData)) {
            const calculatedPenalty = penaltyData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            setTotalPenaltyAmount(calculatedPenalty);
          }
        } catch (err) {
          console.error("Error fetching penalties API:", err);
        }

        // ৬. ইনভেস্টমেন্ট ডাটা ফেচ
        try {
          const investRes = await axios.get(`${API}/investments`, config);
          const investData = investRes.data?.investments || investRes.data?.data || investRes.data || [];
          if (Array.isArray(investData)) {
            const calculatedInvest = investData.reduce((sum, item) => {
              const amount = Number(item.principalAmount || item.amount || item.investAmount || item.totalAmount || 0);
              return sum + amount;
            }, 0);
            setTotalInvested(calculatedInvest);
          }
        } catch (err) {
          console.error("Error fetching investments API:", err);
        }

        // ৭. এক্সিটেড মেম্বারস / রিফান্ড ডাটা ফেচ (সরাসরি /api/members থেকে Exited মেম্বার ফিল্টার করা হলো যেমনটা ExitedMembers পেজে করা হয়েছে)
        try {
          const res = await axios.get(`${API}/members`, config);
          const allMembersData = res.data.members || res.data.data || res.data || [];
          
          if (Array.isArray(allMembersData)) {
            const exited = allMembersData.filter(
              (m) => m.status && m.status.toLowerCase() === "exited"
            );
            const calculatedRefund = exited.reduce(
              (sum, m) => sum + Number(m.refundAmount || 0),
              0
            );
            setTotalRefundAmount(calculatedRefund);
          }
        } catch (err) {
          console.error("Error fetching members refund data:", err);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const targetIncomeCategories = [
    "Admission Fee",
    "Share Capital",
    "Fine / Penalty",
    "Savings Book Fee",
    "Donation",
    "Other Income"
  ];

  const totalFundIncome = fundTransactions
    .filter(t => t && t.type === "INCOME" && targetIncomeCategories.includes(t.category))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = fundTransactions
    .filter(t => t && t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const memberCountForTarget = stats.totalMembers > 0 ? stats.totalMembers : 5;
  const targetPerMember = 38000;
  const totalTargetDeposit = memberCountForTarget * targetPerMember;
  const calculatedTotalDue = Math.max(0, (totalTargetDeposit - Number(totalDepositBalance)) + Number(totalWithdrawal));

  // Main Cash Balance হিসাব (Total Refund Amount বাদ দেওয়া হলো)
  const currentMainCashBalance = (Number(totalDepositBalance) + Number(totalFundIncome) + Number(totalPenaltyAmount) + Number(stats.bankProfit || 0)) - Number(totalLoanGiven) - Number(totalExpense) - Number(totalWithdrawal) - Number(totalInvested) - Number(totalRefundAmount);
  const totalProfit = Number(stats.bankProfit || 0) + Number(totalFundIncome || 0) + Number(totalPenaltyAmount || 0) - Number(totalExpense);

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-black tracking-widest uppercase rounded-full">
              Secure Core System
            </span>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} /> Verified Enterprise
            </span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent tracking-tight">
            Skylark Cooperative Society
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Professional Cooperative Management & Financial Core</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => navigate("/deposit-withdrawal")} 
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <LogOut size={16} />
              <span>Withdraw Money</span>
            </button>
          )}
          <div className="flex items-center gap-2 bg-blue-900/40 backdrop-blur-md text-blue-300 px-4 py-2.5 rounded-2xl text-sm font-bold border border-blue-700/40 shadow-inner">
            <Building size={18} />
            <span>Live System</span>
          </div>
        </div>
      </div>

      {/* Top Navigation / Quick Action Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate("/reports")} 
            className="group relative bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border border-blue-700/40 text-white p-7 rounded-3xl shadow-[0_10px_35px_rgba(15,23,42,0.5)] hover:shadow-[0_15px_45px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute -right-6 -bottom-6 text-blue-500/10 transform group-hover:scale-125 transition duration-500 pointer-events-none">
              <Building size={150} />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-blue-600/20 w-fit rounded-2xl backdrop-blur-xl mb-4 text-blue-400 shadow-inner border border-blue-500/30">
                <Building size={28} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Reports</h3>
              <p className="text-slate-300 text-sm mt-1 font-medium">Generate Reports & Print Statements</p>
            </div>
          </div>

          <div 
            onClick={() => navigate("/members")} 
            className="group relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/40 text-white p-7 rounded-3xl shadow-[0_10px_35px_rgba(15,23,42,0.5)] hover:shadow-[0_15px_45px_rgba(79,70,229,0.4)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute -right-6 -bottom-6 text-indigo-500/10 transform group-hover:scale-125 transition duration-500 pointer-events-none">
              <Users size={150} />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-indigo-600/20 w-fit rounded-2xl backdrop-blur-xl mb-4 text-indigo-400 shadow-inner border border-indigo-500/30">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Members</h3>
              <p className="text-slate-300 text-sm mt-1 font-medium">Manage All Cooperative Members</p>
            </div>
          </div>

          <div 
            onClick={() => navigate("/deposits")} 
            className="group relative bg-gradient-to-br from-teal-900 via-teal-950 to-slate-900 border border-teal-700/40 text-white p-7 rounded-3xl shadow-[0_10px_35px_rgba(15,23,42,0.5)] hover:shadow-[0_15px_45px_rgba(13,148,136,0.4)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute -right-6 -bottom-6 text-teal-500/10 transform group-hover:scale-125 transition duration-500 pointer-events-none">
              <Wallet size={150} />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-teal-600/20 w-fit rounded-2xl backdrop-blur-xl mb-4 text-teal-400 shadow-inner border border-teal-500/30">
                <Wallet size={28} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Deposits</h3>
              <p className="text-slate-300 text-sm mt-1 font-medium">Manage Member Savings & Deposits</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-blue-400 tracking-wider uppercase">Total Members</p>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:text-blue-300 transition">{stats.totalMembers}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-blue-600/40">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-emerald-400 tracking-wider uppercase">Active Members</p>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:text-emerald-300 transition">{stats.activeMembers}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-emerald-600/40">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-rose-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-rose-400 tracking-wider uppercase">Inactive Members</p>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:text-rose-300 transition">{stats.inactiveMembers}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-rose-600/40">
            <UserX size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-purple-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-purple-400 tracking-wider uppercase">Total Loan Given</p>
            <h3 className="text-2xl font-black text-white mt-2">৳ {totalLoanGiven.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-purple-600/40">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 border border-blue-700/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(30,58,138,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-blue-300 tracking-wider uppercase">Main Cash Balance</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {currentMainCashBalance.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-700/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(49,46,129,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-indigo-300 tracking-wider uppercase">Total Deposit Balance</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalDepositBalance.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
            <PiggyBank size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-950 via-red-950 to-slate-900 border border-rose-800/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(159,18,57,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-rose-300 tracking-wider uppercase">Total Due</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {calculatedTotalDue.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-teal-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-teal-400 tracking-wider uppercase">Bank Profit</p>
            <h3 className="text-2xl font-black text-white mt-2">৳ {Number(stats.bankProfit).toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-teal-600/40">
            <Building size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-emerald-400 tracking-wider uppercase">Total Income</p>
            <h3 className="text-2xl font-black text-white mt-2">৳ {totalFundIncome.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-emerald-600/40">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-700/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(15,23,42,0.6)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-indigo-300 tracking-wider uppercase">Total Profit</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalProfit.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-950 via-rose-950 to-slate-900 border border-red-800/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(127,29,29,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-rose-300 tracking-wider uppercase">Total Expense</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalExpense.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
            <ArrowDownRight size={24} />
          </div>
        </div>

        {isAdmin && (
          <div className="bg-gradient-to-br from-purple-950 via-violet-950 to-slate-900 border border-purple-800/50 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(88,28,135,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
            <div>
              <p className="text-[11px] font-black text-purple-300 tracking-wider uppercase">Total Withdrawal</p>
              <h3 className="text-2xl font-black mt-2 text-white">৳ {totalWithdrawal.toLocaleString()}</h3>
            </div>
            <div className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner border border-white/20">
              <LogOut size={24} />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-indigo-300 tracking-wider uppercase">Total Penalty Collection</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalPenaltyAmount.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl group-hover:scale-110 transition duration-300 shadow-lg shadow-indigo-600/40">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/40 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(37,99,235,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-blue-300 tracking-wider uppercase">Total Invested</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalInvested.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner">
            <PiggyBank size={24} />
          </div>
        </div>

        {/* Total Refund Amount Card */}
        <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border border-rose-500/40 text-white p-6 rounded-3xl shadow-[0_10px_35px_rgba(225,29,72,0.4)] hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-rose-300 tracking-wider uppercase">Total Refund Amount</p>
            <h3 className="text-2xl font-black mt-2 text-white">৳ {totalRefundAmount.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl backdrop-blur-xl group-hover:scale-110 transition duration-300 shadow-inner">
            <RefreshCw size={24} />
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 border border-slate-700/80 p-7 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block shadow-md shadow-blue-500/50"></span>
              Monthly Deposit Overview
            </h3>
            <span className="text-xs font-bold bg-blue-950 text-blue-400 px-3.5 py-1.5 rounded-full border border-blue-800/60">
              Jul 2023 - Present
            </span>
          </div>
          <div className="h-64 w-full overflow-x-auto">
            <div style={{ width: Math.max(600, depositChartData.length * 65) }} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depositChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} angle={-35} textAnchor="end" tick={{ fontWeight: 600 }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tick={{ fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', color: '#ffffff', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Deposit Amount']}
                  />
                  <Bar dataKey="amount" fill="url(#colorDeposit)" radius={[8, 8, 0, 0]}>
                    {depositChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 border border-slate-700/80 p-7 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-500 rounded-full inline-block shadow-md shadow-rose-500/50"></span>
              Monthly Due Overview
            </h3>
            <span className="text-xs font-bold bg-rose-950 text-rose-400 px-3.5 py-1.5 rounded-full border border-rose-800/60">
              Jul 2023 - Present
            </span>
          </div>
          <div className="h-64 w-full overflow-x-auto">
            <div style={{ width: Math.max(600, dueChartData.length * 65) }} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#be123c" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} angle={-35} textAnchor="end" tick={{ fontWeight: 600 }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tick={{ fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', color: '#ffffff', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ color: '#fb7185', fontWeight: 'bold' }}
                    formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Due Amount']}
                  />
                  <Bar dataKey="amount" fill="url(#colorDue)" radius={[8, 8, 0, 0]}>
                    {dueChartData.map((entry, index) => (
                      <Cell key={`cell-due-${index}`} fill={index % 2 === 0 ? '#e11d48' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;