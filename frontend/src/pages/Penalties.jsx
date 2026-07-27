import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { Plus, Search, Pencil, Trash2, X, AlertTriangle, Wallet } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Penalties() {
  const API = "https://skylark-cooperative-system.onrender.com/api";

  const [penalties, setPenalties] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState("");

  const initialForm = {
    memberId: "",
    amount: "",
    reason: "",
    status: "Paid",
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.role ? String(userObj.role).toUpperCase() : "");
      }
    } catch (err) {
      console.error("Error reading user role:", err);
    }
  }, []);

  const fetchPenalties = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/penalties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.penalties || res.data?.data || res.data;
      if (Array.isArray(data)) {
        setPenalties(data);
      } else {
        setPenalties([]);
      }
    } catch (error) {
      console.error("Error fetching penalties:", error);
      setPenalties([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const memberData = response.data?.members || response.data?.data || response.data;
      if (Array.isArray(memberData)) {
        setMembers(memberData);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchPenalties();
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userRole !== "SUPER_ADMIN") {
      toast.error("Access Denied! Only SUPER_ADMIN can perform this action.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        memberId: form.memberId,
        amount: form.amount,
        reason: form.reason,
        note: form.reason,
        status: form.status,
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingId) {
        await axios.put(`${API}/penalties/${editingId}`, payload, config);
        toast.success("Penalty updated successfully!");
      } else {
        await axios.post(`${API}/penalties`, payload, config);
        toast.success("Penalty added successfully!");
      }
      fetchPenalties();
      handleCancel();
    } catch (error) {
      console.error("Error saving penalty:", error);
      toast.error(error.response?.data?.message || "Failed to save penalty");
    }
  };

  const editPenalty = (item) => {
    if (userRole !== "SUPER_ADMIN") {
      toast.error("Access Denied! Only SUPER_ADMIN can edit penalties.");
      return;
    }

    setEditingId(item._id);
    setForm({
      memberId: item.member?._id || item.memberId?._id || item.member || item.memberId || "",
      amount: item.amount || "",
      reason: item.reason || item.note || "",
      status: item.status || "Paid",
    });
    setShowModal(true);
  };

  const deletePenalty = async (id) => {
    if (userRole !== "SUPER_ADMIN") {
      toast.error("Access Denied! Only SUPER_ADMIN can delete penalties.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this penalty?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/penalties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Deleted successfully!");
        fetchPenalties();
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  const filteredData = penalties.filter((item) => {
    const reasonStr = (item.reason || item.note || "").toLowerCase();
    const memberName = item.member?.name || item.member?.fullName || item.memberId?.name || item.memberId?.fullName || "";
    const receiptStr = (item.receiptNo || "").toLowerCase();
    return reasonStr.includes(search.toLowerCase()) || memberName.toLowerCase().includes(search.toLowerCase()) || receiptStr.includes(search.toLowerCase());
  });

  const totalPenaltyAmount = filteredData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Colorful Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-6 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                <AlertTriangle className="text-amber-300" size={28} />
              </span> 
              Penalty Management
            </h1>
            <p className="text-blue-100 mt-1.5 text-sm font-medium">Efficiently track member fines, rule violations, and payment records.</p>
          </div>
          <button
            onClick={() => {
              if (userRole !== "SUPER_ADMIN") {
                toast.error("Access Denied! Only SUPER_ADMIN can add penalties.");
                return;
              }
              setEditingId(null); 
              setForm(initialForm); 
              setShowModal(true);
            }}
            className={`relative z-10 flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${userRole !== "SUPER_ADMIN" ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <Plus size={20} className="text-blue-600" /> Add Penalty
          </button>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl shadow-md">
              <Wallet size={26} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Penalty Collection</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">৳ {totalPenaltyAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 text-indigo-400" size={18} />
            <input
              type="text"
              placeholder="Search by receipt, reason or member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm font-medium"
            />
          </div>
        </div>

        {/* Styled Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4 text-center">SL</th>
                  <th className="px-5 py-4">Receipt No</th>
                  <th className="px-5 py-4">Member Name</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Reason / Description</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">No penalties found.</td>
                  </tr>
                ) : (
                  currentData.map((item, index) => {
                    const memberName = item.member?.name || item.member?.fullName || item.memberId?.name || item.memberId?.fullName || "N/A";
                    const memberCode = item.member?.memberId || item.memberId?.memberId ? ` (${item.member?.memberId || item.memberId?.memberId})` : "";
                    const description = item.reason || item.note || "-";
                    const statusVal = item.status || "Paid";
                    const receiptNo = item.receiptNo || "N/A";

                    return (
                      <tr key={item._id || index} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-4 text-center font-semibold text-slate-500">{(page - 1) * limit + index + 1}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigate(`/penalties/receipt/${item._id}`)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                            title="Click to view/print receipt"
                          >
                            {receiptNo}
                          </button>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {memberName} <span className="text-xs font-normal text-slate-500">{memberCode}</span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-rose-600">৳ {Number(item.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{description}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${statusVal === "Paid" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                            {statusVal}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => editPenalty(item)} 
                              title="Edit" 
                              className={`bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl shadow-sm transition transform hover:scale-105 ${userRole !== "SUPER_ADMIN" ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button 
                              onClick={() => deletePenalty(item._id)} 
                              title="Delete" 
                              className={`bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl shadow-sm transition transform hover:scale-105 ${userRole !== "SUPER_ADMIN" ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <Trash2 size={15} />
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
                <h2 className="text-xl font-bold">{editingId ? "Edit Penalty Details" : "Add New Penalty"}</h2>
                <button onClick={handleCancel} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Select Member</label>
                  <select name="memberId" value={form.memberId} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" required>
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m._id || m.id} value={m._id || m.id}>
                        {m.name || m.fullName} {m.memberId ? `(${m.memberId})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount (৳)</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter Amount" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition" required />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Reason / Details</label>
                  <textarea name="reason" value={form.reason} onChange={handleChange} rows={3} placeholder="Late fee, rule violation, etc." className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm resize-none transition" required />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition">
                    <option value="Paid">Paid (পরিশোধিত)</option>
                    <option value="Unpaid">Unpaid (বকেয়া)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={handleCancel} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition">Save Penalty</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Penalties;