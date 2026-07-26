import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-hot-toast";

function Loans() {
  const API = "https://skylark-cooperative-system.onrender.com/api";
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    member: "",
    amount: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    remarks: "",
    status: "Running",
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchMembers();
    fetchLoans();
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    try {
      const userStr = localStorage.getItem("user");
      const r = localStorage.getItem("role");
      
      if (userStr) {
        const user = JSON.parse(userStr);
        const userRole = user.role || user.userRole || r || "";
        if (String(userRole).toUpperCase() === "SUPER_ADMIN" || user.isSuperAdmin === true || localStorage.getItem("isSuperAdmin") === "true") {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } else if (String(r).toUpperCase() === "SUPER_ADMIN" || localStorage.getItem("isSuperAdmin") === "true") {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Role check error:", err);
      setIsSuperAdmin(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API}/members`, getAuthHeader());
      setMembers(res.data.members || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API}/loans`, getAuthHeader());
      setLoans(res.data.loans || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error(editingId ? "Access Denied: Only Super Admin can update loans." : "Access Denied: Only Super Admin can add loans.");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API}/loans/${editingId}`, formData, getAuthHeader());
        toast.success("Loan Updated Successfully");
      } else {
        await axios.post(`${API}/loans`, formData, getAuthHeader());
        toast.success("Loan Added Successfully");
      }
      setEditingId(null);
      setFormData({
        member: "",
        amount: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        remarks: "",
        status: "Running",
      });
      fetchLoans();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation Failed");
    }
  };

  const handleEdit = (loan) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can edit loan records.");
      return;
    }
    setEditingId(loan._id);
    setFormData({
      member: loan.member?._id || loan.member || "",
      amount: loan.amount || "",
      issueDate: loan.issueDate ? loan.issueDate.split("T")[0] : "",
      dueDate: loan.dueDate ? loan.dueDate.split("T")[0] : "",
      remarks: loan.remarks || "",
      status: loan.status || "Running",
    });
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can delete loans.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    try {
      await axios.delete(`${API}/loans/${id}`, getAuthHeader());
      toast.success("Loan Deleted Successfully");
      fetchLoans();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const memberName = loan.member?.name || loan.member?.fullName || "";
    const memberId = loan.member?.memberId || "";
    const remarks = loan.remarks || "";
    return (
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      memberId.toLowerCase().includes(search.toLowerCase()) ||
      remarks.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <MainLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 min-h-screen">
        
        {/* Header Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Loan Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage member loan requests, status, and repayment schedules.</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-700 mb-4">{editingId ? "Edit Loan Details" : "Add New Loan"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Select Member</label>
              <select name="member" value={formData.member} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" required>
                <option value="">-- Choose Member --</option>
                {members.map((member) => (
                  <option key={member._id || member.id} value={member._id || member.id}>
                    {member.memberId ? `${member.memberId} - ` : ""}{member.name || member.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Loan Amount (৳)</label>
              <input type="number" name="amount" placeholder="Enter Amount" value={formData.amount} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" required />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Date</label>
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" required />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition">
                <option value="Running">Running (চলমান)</option>
                <option value="Paid">Paid (পরিশোধিত)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Remarks / Details</label>
              <input type="text" name="remarks" placeholder="Optional remarks" value={formData.remarks} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={!isSuperAdmin}
                className={`px-8 py-3 rounded-xl text-white font-bold text-sm shadow-md transition ${
                  isSuperAdmin 
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 cursor-pointer shadow-indigo-200" 
                    : "bg-slate-400 cursor-not-allowed opacity-60"
                }`}
                title={!isSuperAdmin ? "Only Super Admin can add/update loans" : ""}
              >
                {editingId ? "Update Loan" : "Add Loan"}
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search member or remarks..." 
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm font-medium" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Issue Date</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Receipt No</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">No loans found.</td>
                  </tr>
                ) : (
                  filteredLoans.map((loan, index) => {
                    const serialNum = String(index + 1).padStart(6, '0');
                    const receiptText = loan.receiptNo || `SKY-LOAN-${serialNum}`;

                    return (
                      <tr key={loan._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {loan.member?.memberId || "N/A"} <br />
                          <span className="text-xs font-normal text-slate-500">{loan.member?.name || loan.member?.fullName || "N/A"}</span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-indigo-600">৳ {Number(loan.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{loan.issueDate ? new Date(loan.issueDate).toLocaleDateString() : "N/A"}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "N/A"}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${loan.status === "Paid" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                            {loan.status || "Running"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span 
                            onClick={() => navigate(`/loans/receipt/${loan._id}`, { state: { loan, receiptNo: receiptText } })} 
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg font-bold text-xs hover:bg-indigo-100 cursor-pointer inline-block shadow-xs transition"
                          >
                            {receiptText}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(loan)} 
                              disabled={!isSuperAdmin}
                              className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition ${
                                isSuperAdmin 
                                  ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                                  : "bg-slate-400 cursor-not-allowed opacity-60"
                              }`}
                              title={!isSuperAdmin ? "Only Super Admin can edit loans" : ""}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(loan._id)} 
                              disabled={!isSuperAdmin}
                              className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition ${
                                isSuperAdmin 
                                  ? "bg-rose-600 hover:bg-rose-700 cursor-pointer" 
                                  : "bg-slate-400 cursor-not-allowed opacity-60"
                              }`}
                              title={!isSuperAdmin ? "Only Super Admin can delete loans" : ""}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default Loans;