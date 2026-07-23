import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = "https://skylark-cooperative-system.onrender.com/api";
  const BASE_URL = "https://skylark-cooperative-system.onrender.com";

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
    const role = localStorage.getItem("role");
    const loggedInMemberId = localStorage.getItem("memberId");

    // যদি ইউজার 'member' হয় এবং ইউআরএল-এর id যদি তার নিজের id-এর সাথে না মেলে
    if (role === "member" && loggedInMemberId && id !== loggedInMemberId) {
      // তাকে সরাসরি তার নিজের প্রোফাইল পেজে পাঠিয়ে দেওয়া হবে
      navigate(`/members/${loggedInMemberId}`, { replace: true });
      return;
    }
  }, [id, navigate]);

  useEffect(() => {
    loadMemberProfile();
  }, [id]);

  const loadMemberProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(`${API}/members/${id}`, config);
      
      console.log("API Full Response:", res.data);

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
  const totalDueAmount = (summary?.totalDue ?? 0) + loanAmount + totalWithdrawal;

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-2xl font-bold text-blue-600">Loading Member Profile...</div>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-red-600 text-xl font-bold">Member Not Found</div>
      </MainLayout>
    );
  }

  // ইমেজের সঠিক পাথ তৈরি করার জন্য লজিক
  let profileImageUrl = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/person-circle.svg";
  if (member.photo) {
    if (member.photo.startsWith("http")) {
      profileImageUrl = member.photo;
    } else {
      const cleanFileName = member.photo.replace(/\\/g, '/').split('/').pop();
      profileImageUrl = `${BASE_URL}/uploads/photos/${cleanFileName}`;
    }
  }

  return (
    <MainLayout>
      <div className="profile-print-container p-4">
        
        <div className="flex justify-end mb-4 no-print">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition"
          >
            Print Profile
          </button>
        </div>

        {/* Profile Details */}
        <div className="bg-white shadow rounded-xl p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                  <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Skylark Cooperative Society</h1>
                  <h2 className="text-xl font-bold text-gray-700 mt-1">Member Profile</h2>
              </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <img 
              src={profileImageUrl} 
              className="w-40 h-40 rounded-full object-cover border-4 border-gray-100 shadow-md bg-gray-100" 
              alt={member.name}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/person-circle.svg";
              }}
            />
            <div className="grid grid-cols-2 gap-6 flex-1 w-full">
              <div><p className="text-gray-500 text-sm">Member ID</p><p className="font-bold text-lg text-blue-600">{member.memberId}</p></div>
              <div><p className="text-gray-500 text-sm">Name</p><p className="font-bold text-lg">{member.name}</p></div>
              <div><p className="text-gray-500 text-sm">Father Name</p><p className="font-semibold text-base">{member.fatherName || "-"}</p></div>
              <div><p className="text-gray-500 text-sm">Mother Name</p><p className="font-semibold text-base">{member.motherName || "-"}</p></div>
              <div><p className="text-gray-500 text-sm">Phone</p><p className="font-semibold text-base">{member.phone}</p></div>
              <div><p className="text-gray-500 text-sm">Blood Group</p><p className="font-semibold text-base">{member.bloodGroup || "-"}</p></div>
              <div><p className="text-gray-500 text-sm">Joining Date</p><p className="font-semibold text-base">{member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : "-"}</p></div>
              <div><p className="text-gray-500 text-sm">Status</p><span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">{member.status}</span></div>
              <div className="col-span-2"><p className="text-gray-500 text-sm">Address</p><p className="font-semibold text-base">{member.presentAddress || member.address || "-"}</p></div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: 'Total Deposit', val: totalDeposit, color: 'bg-green-600' },
            { label: 'Total Withdrawal', val: totalWithdrawal, color: 'bg-pink-600' },
            { label: 'Total Deposit Due', val: summary?.totalDue ?? 0, color: 'bg-red-600' },
            { label: 'Total Loan', val: loanAmount, color: 'bg-purple-700' },
            { label: 'Penalty', val: totalPenalty, color: 'bg-yellow-500' },
            { label: 'Advance', val: summary?.advanceBalance ?? 0, color: 'bg-blue-600' },
            { label: 'Current Balance', val: currentBalance, color: 'bg-teal-700' },
            { label: 'Total Due', val: totalDueAmount, color: 'bg-red-800' },
          ].map((item, index) => (
            <div key={index} className={`${item.color} text-white rounded-lg p-4 text-center shadow-md`}>
              <p className="text-[11px] opacity-90 uppercase font-bold tracking-wider">{item.label}</p>
              <h2 className="text-xl font-extrabold mt-1">৳ {item.val}</h2>
            </div>
          ))}
        </div>

        {/* 1. Deposit History */}
        <div className="bg-white border rounded-xl mb-8 overflow-hidden shadow-sm">
            <h2 className="text-xl font-bold p-4 bg-blue-600 text-white">Deposit History</h2>
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-blue-800">
                <tr><th className="p-3">Month</th><th>Year</th><th>Amount</th><th>Receipt</th></tr>
              </thead>
              <tbody>
                {deposits.length > 0 ? deposits.map((d, index) => (
                  <tr key={d._id || index} className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'} hover:bg-blue-100 transition-colors`}>
                      <td className="p-3">{d.month}</td>
                      <td>{d.year}</td>
                      <td className="font-bold text-green-700">৳ {d.amount || d.paidAmount || 0}</td>
                      <td className="p-2">
                        <a href={`${API}/deposit-receipt/${d._id}`} 
                           target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline cursor-pointer">
                           {d.receiptNo || "View"}
                        </a>
                      </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No deposit history found.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* 2. Loan History */}
        <div className="bg-white border rounded-xl mb-8 overflow-hidden shadow-sm">
            <h2 className="text-xl font-bold p-4 bg-purple-700 text-white">Loan History</h2>
            <table className="w-full text-sm">
              <thead className="bg-purple-50 text-purple-800">
                <tr><th className="p-3">Date</th><th>Amount</th><th>Receipt No</th><th>Note</th></tr>
              </thead>
              <tbody>
                {loans.length > 0 ? loans.map((l, index) => (
                  <tr key={l._id || index} className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'} hover:bg-purple-100 transition-colors`}>
                      <td className="p-3">{new Date(l.issueDate || l.date || l.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-purple-700">৳ {l.amount || 0}</td>
                      <td className="font-semibold text-blue-600">{l.receiptNo || "N/A"}</td>
                      <td className="italic text-gray-500">{l.remarks || l.note || "N/A"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No loan history found.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* 3. Penalty History */}
        <div className="bg-white border rounded-xl mb-8 overflow-hidden shadow-sm">
            <h2 className="text-xl font-bold p-4 bg-yellow-600 text-white">Penalty History</h2>
            <table className="w-full text-sm">
              <thead className="bg-yellow-50 text-yellow-800">
                <tr><th className="p-3">Date</th><th>Amount</th><th>Receipt No</th><th>Note</th></tr>
              </thead>
              <tbody>
                {penalties.length > 0 ? penalties.map((p, index) => (
                  <tr key={p._id || index} className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-yellow-50/30'} hover:bg-yellow-100 transition-colors`}>
                      <td className="p-3">{new Date(p.date || p.penaltyDate || p.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-yellow-700">৳ {p.amount || p.fineAmount || p.total || p.penaltyAmount || 0}</td>
                      <td className="font-semibold text-blue-600">{p.receiptNo || "N/A"}</td>
                      <td className="italic text-gray-500">{p.note || p.reason || p.description || "N/A"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No penalty history found.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* 4. Withdrawal History */}
        <div className="bg-white border rounded-xl mb-8 overflow-hidden shadow-sm">
            <h2 className="text-xl font-bold p-4 bg-pink-600 text-white">Withdrawal History</h2>
            <table className="w-full text-sm">
              <thead className="bg-pink-50 text-pink-800">
                <tr><th className="p-3">Date</th><th>Amount</th><th>Receipt No</th><th>Note</th></tr>
              </thead>
              <tbody>
                {withdrawals.length > 0 ? withdrawals.map((w, index) => (
                  <tr key={w._id || index} className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'} hover:bg-pink-100 transition-colors`}>
                      <td className="p-3">{new Date(w.date || w.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-red-600">৳ {w.amount}</td>
                      <td className="font-semibold text-blue-600">{w.receiptNo || "N/A"}</td>
                      <td className="italic text-gray-500">{w.note || "N/A"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-4 text-center text-gray-500">No withdrawal history found.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* 5. Payment Allocation History */}
        <div className="bg-white border rounded-xl mb-12 overflow-hidden shadow-sm">
            <h2 className="text-xl font-bold p-4 bg-purple-600 text-white">Payment Allocation History</h2>
            <table className="w-full text-sm">
              <thead className="bg-purple-50 text-purple-800">
                <tr><th className="p-3">Year</th><th>Month</th><th>Amount</th><th>Paid</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {allocation.length > 0 ? allocation.map((item, index) => (
                  <tr key={item._id || index} className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'} hover:bg-purple-100 transition-colors`}>
                      <td className="p-3">{item.year}</td>
                      <td>{item.monthName || item.month}</td>
                      <td>৳ {item.monthlyAmount || item.amount || 0}</td>
                      <td className="text-green-600 font-bold">৳ {item.paidAmount || 0}</td>
                      <td className="text-red-600 font-bold">৳ {item.dueAmount || 0}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status || "Due"}
                        </span>
                      </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-4 text-center text-gray-500">No allocation history found.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* Signature */}
        <div className="signature-section mt-16 flex justify-between items-center px-8">
          <div className="text-center">
            <div className="border-t-2 border-black w-48 mb-2"></div>
            <p className="font-bold">Member Signature</p>
          </div>
          <div className="text-center">
            <div className="mb-1"><img src="/signature.png" alt="Authorized Signature" className="w-32 mx-auto h-12 object-contain" /></div>
            <div className="border-t-2 border-black w-48 mb-2"></div>
            <p className="font-bold">Authorized Signature</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MemberProfile;