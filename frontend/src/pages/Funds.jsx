import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

function Funds() {
  // ================= State Management =================
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterMethod, setFilterMethod] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Helper function for local YYYY-MM-DD date (Timezone safe)
  const getLocalDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form State (Added date field with default today's date)
  const initialForm = {
    type: "INCOME",
    category: "",
    memberId: "",
    amount: "",
    paymentMethod: "Cash",
    description: "",
    date: getLocalDateString(),
  };
  const [form, setForm] = useState(initialForm);

  // ================= Super Admin Check =================
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const r = storedUser.role || localStorage.getItem("role") || "MEMBER";

      if (
        r === "SUPER_ADMIN" || 
        storedUser.isSuperAdmin === true || 
        localStorage.getItem("isSuperAdmin") === "true"
      ) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (e) {
      setIsSuperAdmin(false);
    }
  }, []);

  // ================= Fetch Data =================
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://skylark-cooperative-system.onrender.com/api/funds", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache"
        },
        cache: "no-store"
      });
      const data = await response.json();
      if (data && data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://skylark-cooperative-system.onrender.com/api/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const memberData = response.data?.members || response.data;
      if (Array.isArray(memberData)) {
        setMembers(memberData);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchMembers();
  }, []);

  // ================= Math Calculations & Breakdowns =================
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalIncome = safeTransactions
    .filter((t) => t && t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = safeTransactions
    .filter((t) => t && t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // Category-wise Calculations
  const incomeCategories = [
    "Admission Fee",
    "Share Capital",
    "Savings Book Fee",
    "Bank Profit",
    "Donation",
    "Other Income"
  ];

  const expenseCategories = [
    "Office Expense",
    "Utility Bill",
    "Bank Charge",
    "Office Rent",
    "Entertainment",
    "Loan Disbursement",
    "Other Expense"
  ];

  const incomeBreakdown = incomeCategories.reduce((acc, cat) => {
    acc[cat] = safeTransactions
      .filter((t) => t && t.type === "INCOME" && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return acc;
  }, {});

  const expenseBreakdown = expenseCategories.reduce((acc, cat) => {
    acc[cat] = safeTransactions
      .filter((t) => t && t.type === "EXPENSE" && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return acc;
  }, {});

  // ================= Handle Actions =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setForm({ ...form, type: value, category: "", memberId: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can add transactions.");
      return;
    }
    setEditingId(null);
    setForm({
      ...initialForm,
      date: getLocalDateString()
    });
    setShowModal(true);
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can perform this action.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `https://skylark-cooperative-system.onrender.com/api/funds/${editingId}`
        : "https://skylark-cooperative-system.onrender.com/api/funds";
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data && data.success) {
        toast.success(editingId ? "Updated successfully!" : "Saved successfully!");
        fetchTransactions();
        handleCancel();
      } else {
        toast.error(data.message || "Failed to save transaction");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction");
    }
  };

  // Edit Trigger (Fixed Date Parsing for local timezone display)
  const editTransaction = (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can edit transactions.");
      return;
    }

    const item = safeTransactions.find((t) => t && t._id === id);
    if (item) {
      setEditingId(id);
      
      let resolvedMemberId = "";
      if (typeof item.memberId === "string") {
        resolvedMemberId = item.memberId;
      } else if (item.memberId && item.memberId._id) {
        resolvedMemberId = item.memberId._id;
      } else if (item.member && item.member._id) {
        resolvedMemberId = item.member._id;
      }

      let formattedDate = getLocalDateString();
      const targetDateValue = item.date || item.createdAt;
      
      if (targetDateValue) {
        if (typeof targetDateValue === "string" && targetDateValue.length >= 10) {
          formattedDate = targetDateValue.substring(0, 10);
        } else {
          const d = new Date(targetDateValue);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        }
      }

      setForm({
        type: item.type || "INCOME",
        category: item.category || "",
        memberId: resolvedMemberId,
        amount: item.amount || "",
        paymentMethod: item.paymentMethod || "Cash",
        description: item.description || "",
        date: formattedDate,
      });
      setShowModal(true);
    }
  };

  // Delete Trigger
  const deleteTransaction = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can delete transactions.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`https://skylark-cooperative-system.onrender.com/api/funds/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data && data.success) {
          toast.success("Deleted successfully!");
          fetchTransactions();
        } else {
          toast.error(data.message || "Failed to delete transaction");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      }
    }
  };

  // ================= Filtering & Pagination Logic =================
  const filteredData = safeTransactions.filter((item) => {
    if (!item) return false;
    const categoryStr = item.category ? String(item.category).toLowerCase() : "";
    const descStr = item.description ? String(item.description).toLowerCase() : "";
    
    const memberNameStr = item.memberName || item.member?.name || item.member?.fullName || "";
    const matchMemberName = String(memberNameStr).toLowerCase();
    
    const matchesSearch =
      categoryStr.includes(search.toLowerCase()) ||
      descStr.includes(search.toLowerCase()) ||
      matchMemberName.includes(search.toLowerCase());
    
    const matchesType = filterType === "ALL" || item.type === filterType;
    const matchesMethod = filterMethod === "ALL" || item.paymentMethod === filterMethod;

    return matchesSearch && matchesType && matchesMethod;
  });

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Fund & Transaction Management
          </h1>
          <p className="text-gray-500 mt-1">Track income, expenses, and current cash flow easily.</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!isSuperAdmin}
          className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-lg shadow transition duration-200 text-white ${
            isSuperAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          title={!isSuperAdmin ? "Only Super Admin can add transactions" : ""}
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider">Total Income</h3>
          <p className="text-3xl font-black text-green-900 mt-2">৳ {(totalIncome || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider">Total Expense</h3>
          <p className="text-3xl font-black text-red-900 mt-2">৳ {(totalExpense || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Net Balance</h3>
          <p className="text-3xl font-black text-blue-900 mt-2">৳ {(netBalance || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Category Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <TrendingUp className="text-green-600" size={22} />
            <h2 className="text-lg font-bold text-gray-800">Income Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomeCategories.map((cat) => (
              <div key={cat} className="bg-green-50/50 p-3 rounded-lg border border-green-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-green-800">{cat}</span>
                <span className="text-sm font-bold text-green-900">৳ {(incomeBreakdown[cat] || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <TrendingDown className="text-red-600" size={22} />
            <h2 className="text-lg font-bold text-gray-800">Expense Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseCategories.map((cat) => (
              <div key={cat} className="bg-red-50/50 p-3 rounded-lg border border-red-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-red-800">{cat}</span>
                <span className="text-sm font-bold text-red-900">৳ {(expenseBreakdown[cat] || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search category, description or member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-4 py-2.5 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="border px-4 py-2.5 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b">
                <th className="px-4 py-4 text-center">SL</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Member Name</th>
                <th className="px-4 py-4 text-right">Amount</th>
                <th className="px-4 py-4">Method</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-gray-600">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 font-medium text-gray-400">No transactions found.</td>
                </tr>
              ) : (
                currentData.map((item, index) => {
                  const rowMemberName = item?.memberName || item?.member?.name || item?.member?.fullName || "-";
                  const itemDate = item?.date || item?.createdAt;
                  
                  let displayDateFormatted = "-";
                  if (itemDate) {
                    const dObj = new Date(itemDate);
                    if (!isNaN(dObj.getTime())) {
                      displayDateFormatted = dObj.toLocaleDateString();
                    }
                  }

                  return (
                    <tr key={item ? item._id : index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center font-medium">{(page - 1) * limit + index + 1}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${item && item.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item ? item.type : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{item ? item.category : ""}</td>
                      <td className="px-4 py-3 text-blue-600 font-medium">{rowMemberName}</td>
                      <td className="px-4 py-3 text-right font-bold">৳ {Number(item ? item.amount : 0).toLocaleString()}</td>
                      <td className="px-4 py-3">{item ? item.paymentMethod : ""}</td>
                      <td className="px-4 py-3">{item && item.description ? item.description : "-"}</td>
                      <td className="px-4 py-3">{displayDateFormatted}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => editTransaction(item._id)} 
                            disabled={!isSuperAdmin}
                            className={`p-2 rounded-lg transition text-white ${isSuperAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                            title={!isSuperAdmin ? "Only Super Admin can edit" : ""}
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(item._id)} 
                            disabled={!isSuperAdmin}
                            className={`p-2 rounded-lg transition text-white ${isSuperAdmin ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}
                            title={!isSuperAdmin ? "Only Super Admin can delete" : ""}
                          >
                            <Trash2 size={16} />
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

      {/* Pagination Block */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow border">
          <span className="text-sm text-gray-500">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-5">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-700">{editingId ? "Edit Transaction" : "Add New Transaction"}</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-red-600 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Transaction Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none">
                    <option value="INCOME">INCOME (আয়)</option>
                    <option value="EXPENSE">EXPENSE (খরচ)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none" required>
                    <option value="">Select Category</option>
                    {form.type === "INCOME" ? (
                      <>
                        <option value="Admission Fee">Admission Fee (ভর্তি ফি)</option>
                        <option value="Share Capital">Share Capital (শেয়ার ফি)</option>
                        <option value="Savings Book Fee">Savings Book Fee (সঞ্চয় বই ফি)</option>
                        <option value="Bank Profit">Bank Profit (ব্যাংক প্রফিট/মুনাফা)</option>
                        <option value="Donation">Donation (অনুদান)</option>
                        <option value="Other Income">Other Income (অন্যান্য আয়)</option>
                      </>
                    ) : (
                      <>
                        <option value="Office Expense">Office Expense (অফিস খরচ)</option>
                        <option value="Utility Bill">Utility Bill (ইউটিলিটি বিল)</option>
                        <option value="Bank Charge">Bank Charge (ব্যাংক চার্জ)</option>
                        <option value="Office Rent">Office Rent (অফিস ভাড়া)</option>
                        <option value="Entertainment">Entertainment (নাস্তা/আপ্যায়ন)</option>
                        <option value="Loan Disbursement">Loan Disbursement (ঋণ প্রদান)</option>
                        <option value="Other Expense">Other Expense (অন্যান্য ব্যয়)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">Member (Optional)</label>
                  <select 
                    name="memberId" 
                    value={form.memberId} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none" 
                  >
                    <option value="">-- Select Member --</option>
                    {Array.isArray(members) && members.map((m) => {
                      if (!m) return null;
                      const displayName = m.name || m.memberName || m.fullName || "Unknown Member";
                      const customId = m.memberId ? ` (${m.memberId})` : "";
                      return (
                        <option key={m._id || m.id} value={m._id || m.id}>
                          {displayName}{customId}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Amount (৳)</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter Amount" className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none" required />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none">
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Bkash">Bkash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>

                {/* Date Input Field */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none" 
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Write Details..." className="w-full border rounded-lg px-4 py-3 bg-gray-50 outline-none resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!isSuperAdmin}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium ${isSuperAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                  title={!isSuperAdmin ? "Only Super Admin can save transactions" : ""}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Funds;