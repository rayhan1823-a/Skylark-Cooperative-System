import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function MemberProfile() {
  const params = useParams();
  const navigate = useNavigate();
  const API = "https://skylark-cooperative-system.onrender.com/api";
  const BASE_URL = "https://skylark-cooperative-system.onrender.com";

  // ── নিজস্ব বা নির্দিষ্ট মেম্বার আইডি বের করার লজিক (ফিক্সড) ──
  const loggedInMemberId = localStorage.getItem("memberId") || localStorage.getItem("userId") || localStorage.getItem("id");
  const id = params.id || loggedInMemberId;

  const [member, setMember] = useState(null);
  const [summary, setSummary] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [loans, setLoans] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loanAmount, setLoanAmount] = useState(0);

  // ── সাধারণ সদস্য হলে সে কেবল নিজের প্রোফাইল দেখবে তা নিশ্চিত করা ──
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (role === "member" && loggedInMemberId && params.id && params.id !== loggedInMemberId) {
      navigate(`/members/${loggedInMemberId}`, { replace: true });
      return;
    }
  }, [params.id, navigate, loggedInMemberId]);

  useEffect(() => {
    if (id) {
      loadMemberProfile();
    }
  }, [id]);

  const loadMemberProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(`${API}/members/${id}`, config);
      
      const responseData = res.data.success !== undefined ? res.data : { success: true, ...res.data };

      if (responseData) {
        setMember(responseData.member || responseData);
        setSummary(responseData.summary || {});
        setDeposits(responseData.deposits || responseData.payments || []);
        setWithdrawals(responseData.withdrawals || []);
        setAllocation(responseData.allocations || []);
        setLoans(responseData.loans || responseData.loanHistory || responseData.memberLoans || []);
        
        setPenalties(
          res.data.penalties || 
          responseData.penalties || 
          res.data.memberPenalties || 
          responseData.memberPenalties || 
          res.data.penaltyHistory || 
          responseData.penaltyHistory || 
          res.data.fines || 
          []
        );
        
        setLoanAmount(responseData.totalLoan || responseData.summary?.totalLoan || 0);
      }
    } catch (error) {
      console.error("Member Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalDeposit = summary?.totalDeposit ?? deposits.reduce((sum, d) => sum + Number(d.amount || d.paidAmount || 0), 0);
  const totalWithdrawal = summary?.totalWithdrawal ?? withdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const totalPenalty = summary?.totalPenalty ?? penalties.reduce((sum, p) => sum + Number(p.amount || p.fineAmount || p.total || p.penaltyAmount || 0), 0);

  const currentBalance = totalDeposit - totalWithdrawal - loanAmount;
  const totalDueAmount = summary?.totalDue ?? 0;

  if (loading) {
    return (
      <div className="flex-1 p-10 text-center text-2xl font-bold text-indigo-600 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white tracking-wide font-medium">Loading Member Profile...</span>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex-1 p-10 text-center text-rose-500 text-xl font-bold bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-md">
          Member Not Found
        </div>
      </div>
    );
  }

  let profileImageUrl = "";
  if (member.photo) {
    if (member.photo.startsWith("http") || member.photo.startsWith("blob")) {
      profileImageUrl = member.photo;
    } else if (member.photo.startsWith("/uploads")) {
      profileImageUrl = `${BASE_URL}${member.photo}`;
    } else if (member.photo.startsWith("uploads")) {
      profileImageUrl = `${BASE_URL}/${member.photo}`;
    } else {
      const cleanFileName = member.photo.replace(/\\/g, '/').split('/').pop();
      profileImageUrl = `${BASE_URL}/uploads/photos/${cleanFileName}`;
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 min-h-screen">
      <div className="profile-print-container max-w-7xl mx-auto space-y-8">
        
        {/* Top Print Button */}
        <div className="flex justify-end mb-2 no-print">
          <button 
            onClick={() => window.print()} 
            className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white px-7 py-3 rounded-2xl hover:from-indigo-700 hover:to-blue-800 font-bold shadow-xl shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Profile
          </button>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white/80 backdrop-blur-2xl shadow-2xl shadow-indigo-900/5 rounded-[2.5rem] p-6 lg:p-10 border border-white/80 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-2.5 shadow-inner border border-indigo-100/80">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
              </div>
              <div>
                  <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent tracking-tight">Skylark Cooperative Society</h1>
                  <p className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mt-1">Member Profile Record</p>
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* ফিক্সড: ইমেজ সুন্দরভাবে জুম ও পারফেক্ট ফিট করার জন্য object-cover এবং scale-110 ব্যবহার করা হয়েছে */}
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  className="w-40 h-40 rounded-full object-cover scale-110 border-4 border-white shadow-2xl bg-slate-100 relative transform transition duration-500 group-hover:scale-[1.15]" 
                  alt={member.name}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.style.display = "none";
                    const fallbackEl = document.getElementById("fallback-avatar");
                    if (fallbackEl) fallbackEl.style.display = "flex";
                  }}
                />
              ) : null}

              <div 
                id="fallback-avatar" 
                className={`w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 text-white font-black items-center justify-center text-5xl border-4 border-white shadow-2xl relative ${profileImageUrl ? 'hidden' : 'flex'}`}
              >
                {member.name ? member.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 w-full bg-gradient-to-br from-slate-50/80 to-indigo-50/30 p-7 rounded-3xl border border-white/80 shadow-inner">
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Member ID</p><p className="font-black text-lg text-indigo-600 mt-1">{member.memberId}</p></div>
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Name</p><p className="font-black text-lg text-slate-900 mt-1">{member.name}</p></div>
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Father Name</p><p className="font-bold text-base text-slate-700 mt-1">{member.fatherName || "-"}</p></div>
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Mother Name</p><p className="font-bold text-base text-slate-700 mt-1">{member.motherName || "-"}</p></div>
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Phone</p><p className="font-bold text-base text-slate-700 mt-1">{member.phone}</p></div>
              
              {/* ইমার্জেন্সি নম্বর */}
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Emergency Number</p><p className="font-bold text-base text-slate-700 mt-1">{member.emergencyNumber || member.emergencyPhone || member.emergencyContact || "-"}</p></div>
              
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Blood Group</p><p className="font-extrabold text-base text-rose-600 mt-1">{member.bloodGroup || "-"}</p></div>
              <div><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Joining Date</p><p className="font-bold text-base text-slate-700 mt-1">{member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : "-"}</p></div>
              <div>
                <p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Status</p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3.5 py-1 rounded-full text-xs font-black shadow-md shadow-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    {member.status}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2"><p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Address</p><p className="font-bold text-base text-slate-700 mt-1">{member.presentAddress || member.address || "-"}</p></div>
            </div>
          </div>
        </div>

        {/* Summary Cards with Vibrant Gradients & Micro-interactions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Deposit', val: totalDeposit, bg: 'from-emerald-500 via-teal-600 to-emerald-700', shadow: 'shadow-emerald-500/20' },
            { label: 'Total Withdrawal', val: totalWithdrawal, bg: 'from-pink-500 via-rose-600 to-pink-700', shadow: 'shadow-pink-500/20' },
            { label: 'Total Loan', val: loanAmount, bg: 'from-purple-600 via-indigo-700 to-purple-800', shadow: 'shadow-purple-500/20' },
            { label: 'Penalty', val: totalPenalty, bg: 'from-amber-500 via-orange-600 to-amber-600', shadow: 'shadow-amber-500/20' },
            { label: 'Advance', val: summary?.advanceBalance ?? 0, bg: 'from-blue-500 via-cyan-600 to-blue-700', shadow: 'shadow-blue-500/20' },
            { label: 'Current Balance', val: currentBalance, bg: 'from-teal-600 via-emerald-700 to-teal-800', shadow: 'shadow-teal-500/20' },
            { label: 'Total Due', val: totalDueAmount, bg: 'from-rose-600 via-red-700 to-rose-800', shadow: 'shadow-rose-500/20' },
          ].map((item, index) => (
            <div key={index} className={`bg-gradient-to-br ${item.bg} text-white rounded-3xl p-5 text-center shadow-xl ${item.shadow} transform hover:-translate-y-1.5 transition-all duration-300 border border-white/20 relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] opacity-90 uppercase font-black tracking-widest relative z-10">{item.label}</p>
              <h2 className="text-lg lg:text-xl font-black mt-2.5 relative z-10 drop-shadow-sm">৳ {item.val}</h2>
            </div>
          ))}
        </div>

        {/* 1. Deposit History */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 px-7">
              <h2 className="text-lg font-black text-white tracking-wide">Deposit History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 text-center">Month</th><th className="text-center">Year</th><th className="text-center">Amount</th><th className="text-center">Receipt</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deposits.length > 0 ? deposits.map((d, index) => (
                    <tr key={d._id || index} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-indigo-50/60 transition-colors`}>
                        <td className="p-4 font-bold text-slate-800">{d.month}</td>
                        <td className="text-slate-600 font-medium">{d.year}</td>
                        <td className="font-black text-emerald-600 text-base">৳ {d.amount || d.paidAmount || 0}</td>
                        <td className="p-3">
                          <a href={`${API}/deposit-receipt/${d._id}`} 
                             target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 font-extrabold px-3.5 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                             {d.receiptNo || "View"}
                          </a>
                        </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No deposit history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* 2. Loan History */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-5 px-7">
              <h2 className="text-lg font-black text-white tracking-wide">Loan History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 text-center">Date</th><th className="text-center">Amount</th><th className="text-center">Receipt No</th><th className="text-center">Note</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.length > 0 ? loans.map((l, index) => (
                    <tr key={l._id || index} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-purple-50/60 transition-colors`}>
                        <td className="p-4 text-slate-700 font-bold">{new Date(l.issueDate || l.date || l.createdAt).toLocaleDateString()}</td>
                        <td className="font-black text-purple-700 text-base">৳ {l.amount || 0}</td>
                        <td className="font-extrabold text-indigo-600">{l.receiptNo || "N/A"}</td>
                        <td className="italic text-slate-500 font-medium">{l.remarks || l.note || "N/A"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No loan history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* 3. Penalty History */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 p-5 px-7">
              <h2 className="text-lg font-black text-white tracking-wide">Penalty History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 text-center">Date</th><th className="text-center">Amount</th><th className="text-center">Receipt No</th><th className="text-center">Note</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penalties.length > 0 ? penalties.map((p, index) => (
                    <tr key={p._id || index} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-amber-50/60 transition-colors`}>
                        <td className="p-4 text-slate-700 font-bold">{new Date(p.date || p.penaltyDate || p.createdAt).toLocaleDateString()}</td>
                        <td className="font-black text-amber-600 text-base">৳ {p.amount || p.fineAmount || p.total || p.penaltyAmount || 0}</td>
                        <td className="font-extrabold text-indigo-600">{p.receiptNo || "N/A"}</td>
                        <td className="italic text-slate-500 font-medium">{p.note || p.reason || p.description || "N/A"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No penalty history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* 4. Withdrawal History */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 p-5 px-7">
              <h2 className="text-lg font-black text-white tracking-wide">Withdrawal History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 text-center">Date</th><th className="text-center">Amount</th><th className="text-center">Receipt No</th><th className="text-center">Note</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.length > 0 ? withdrawals.map((w, index) => (
                    <tr key={w._id || index} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-pink-50/60 transition-colors`}>
                        <td className="p-4 text-slate-700 font-bold">{new Date(w.date || w.createdAt).toLocaleDateString()}</td>
                        <td className="font-black text-rose-600 text-base">৳ {w.amount}</td>
                        <td className="font-extrabold text-indigo-600">{w.receiptNo || "N/A"}</td>
                        <td className="italic text-slate-500 font-medium">{w.note || "N/A"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No withdrawal history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* 5. Payment Allocation History */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 mb-12">
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-5 px-7">
              <h2 className="text-lg font-black text-white tracking-wide">Payment Allocation History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 text-center">Year</th><th className="text-center">Month</th><th className="text-center">Amount</th><th className="text-center">Paid</th><th className="text-center">Due</th><th className="text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocation.length > 0 ? allocation.map((item, index) => (
                    <tr key={item._id || index} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-indigo-50/60 transition-colors`}>
                        <td className="p-4 text-slate-700 font-bold">{item.year}</td>
                        <td className="font-bold text-slate-800">{item.monthName || item.month}</td>
                        <td className="font-extrabold text-slate-600">৳ {item.monthlyAmount || item.amount || 0}</td>
                        <td className="text-emerald-600 font-black">৳ {item.paidAmount || 0}</td>
                        <td className="text-rose-600 font-black">৳ {item.dueAmount || 0}</td>
                        <td>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                              {item.status || "Due"}
                          </span>
                        </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400 font-medium">No allocation history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* Signature - Fixed with page-break protection for printing */}
        <div className="signature-section mt-16 pt-8 flex justify-between items-end px-8 pb-10 page-break-inside-avoid border-t-2 border-slate-200">
          <div className="text-center">
            <div className="border-t-2 border-slate-800 w-48 mb-2"></div>
            <p className="font-extrabold text-sm text-black print:text-black">Member Signature</p>
          </div>
          <div className="text-center">
            <div className="mb-2">
              <img src="/signature.png" alt="Authorized Signature" className="w-32 mx-auto h-12 object-contain" />
            </div>
            <div className="border-t-2 border-slate-800 w-48 mb-2"></div>
            <p className="font-extrabold text-sm text-black print:text-black">Authorized Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MemberProfile;