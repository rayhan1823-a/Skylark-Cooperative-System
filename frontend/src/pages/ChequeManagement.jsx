import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ChequeManagement() {
  const [cheques, setCheques] = useState([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, used: 0, cancelled: 0 });
  const [loading, setLoading] = useState(false);

  // States for Search, Filter, Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState(null);

  // Form Data State
  const [formData, setFormData] = useState({
    chequeNo: "",
    bankName: "",
    accountNo: "",
    status: "Available",
    issueDate: "",
    usedDate: "",
    usedFor: "",
    remarks: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const token = localStorage.getItem("token");

  // সঠিক ফরম্যাটে কনফিগারেশন অবজেক্ট
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch Cheques & Summary
  const fetchCheques = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/cheques?search=${search}&status=${statusFilter}&sort=${sort}&page=${page}&limit=${limit}`,
        config
      );
      if (res.data.success) {
        setCheques(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching cheques:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cheques/summary`, config);
      if (res.data.success) {
        setSummary(res.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchCheques();
    fetchSummary();
  }, [search, statusFilter, sort, page]);

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedChequeId(null);
    setFormData({
      chequeNo: "",
      bankName: "",
      accountNo: "",
      status: "Available",
      issueDate: "",
      usedDate: "",
      usedFor: "",
      remarks: "",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cheque) => {
    setIsEditMode(true);
    setSelectedChequeId(cheque._id);
    setFormData({
      chequeNo: cheque.chequeNo || "",
      bankName: cheque.bankName || "",
      accountNo: cheque.accountNo || "",
      status: cheque.status || "Available",
      issueDate: cheque.issueDate ? cheque.issueDate.split("T")[0] : "",
      usedDate: cheque.usedDate ? cheque.usedDate.split("T")[0] : "",
      usedFor: cheque.usedFor || "",
      remarks: cheque.remarks || "",
    });
    setIsModalOpen(true);
  };

  // Handle Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/cheques/${selectedChequeId}`, formData, config);
        alert("চেক সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await axios.post(`${API_BASE_URL}/cheques`, formData, config);
        alert("নতুন চেক সফলভাবে যুক্ত করা হয়েছে!");
      }
      setIsModalOpen(false);
      fetchCheques();
      fetchSummary();
    } catch (error) {
      console.error("Error saving cheque:", error);
      alert(error.response?.data?.message || "কিছু সমস্যা হয়েছে!");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই চেকটি ডিলিট করতে চান?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/cheques/${id}`, config);
      alert("চেক সফলভাবে মুছে ফেলা হয়েছে!");
      fetchCheques();
      fetchSummary();
    } catch (error) {
      console.error("Error deleting cheque:", error);
      alert(error.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে!");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FaMoneyCheckAlt className="text-blue-500" /> Cheque Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            কোম্পানির সমস্ত ব্যাংকের চেক রেজিস্টার, স্ট্যাটাস ও ব্যবহার ট্র্যাক করুন।
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all duration-300"
          >
            <FaPlus /> Add New Cheque
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <p className="text-slate-400 text-xs font-semibold">Total Cheques</p>
          <h3 className="text-2xl font-black text-white mt-1">{summary.total}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5"><FaCheckCircle /> Available</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{summary.available}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <p className="text-amber-400 text-xs font-semibold flex items-center gap-1.5"><FaExclamationCircle /> Used</p>
          <h3 className="text-2xl font-black text-amber-400 mt-1">{summary.used}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5"><FaTimesCircle /> Cancelled</p>
          <h3 className="text-2xl font-black text-rose-400 mt-1">{summary.cancelled}</h3>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search by Cheque, Bank, Account..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Used">Used</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="chequeNo">Cheque No (Asc)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Cheque No</th>
                <th className="p-4">Bank & Account</th>
                <th className="p-4">Status</th>
                <th className="p-4">Used For</th>
                <th className="p-4">Added By</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Loading cheques...</td>
                </tr>
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">কোনো চেক পাওয়া যায়নি।</td>
                </tr>
              ) : (
                cheques.map((cheque) => (
                  <tr key={cheque._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{cheque.chequeNo}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{cheque.bankName}</p>
                      <p className="text-xs text-slate-400">A/C: {cheque.accountNo}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          cheque.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : cheque.status === "Used"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {cheque.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {cheque.usedFor || <span className="text-slate-600">-</span>}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {cheque.addedBy?.name || "System"}
                    </td>
                    <td className="p-4 text-center">
                      {isSuperAdmin && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(cheque)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(cheque._id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? "Edit Cheque" : "Add New Cheque"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cheque Number *</label>
                <input
                  type="text"
                  name="chequeNo"
                  required
                  value={formData.chequeNo}
                  onChange={handleChange}
                  placeholder="e.g. CHQ-00123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. Islami Bank"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Account No *</label>
                  <input
                    type="text"
                    name="accountNo"
                    required
                    value={formData.accountNo}
                    onChange={handleChange}
                    placeholder="e.g. 123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Used">Used</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Used For</label>
                  <select
                    name="usedFor"
                    value={formData.usedFor}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Purpose --</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Loan">Loan</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Investment">Investment</option>
                    <option value="Office Expense">Office Expense</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Used Date</label>
                  <input
                    type="date"
                    name="usedDate"
                    value={formData.usedDate}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Optional notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  {isEditMode ? "Update Cheque" : "Save Cheque"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChequeManagement;