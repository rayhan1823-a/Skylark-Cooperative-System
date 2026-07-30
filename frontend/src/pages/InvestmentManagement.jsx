import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  FaPiggyBank, 
  FaPlus, 
  FaSearch, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaBuilding, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaEye
} from "react-icons/fa";

// পরিবেশ অনুযায়ী স্বয়ংক্রিয়ভাবে API URL নির্ধারণ করা (লোকালহোস্ট অথবা লাইভ সার্ভার)
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api" 
  : "https://skylark-cooperative-system.onrender.com/api";

function InvestmentManagement() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);

  // SUPER_ADMIN রোল চেক করার লজিক
  const userRole = localStorage.getItem("role") || "";
  const isSuperAdmin = userRole.toUpperCase() === "SUPER_ADMIN";

  // Backend Model এর সাথে সামঞ্জস্য রেখে Form State
  const [formData, setFormData] = useState({
    investmentType: "FDR",
    institutionName: "",
    accountOrCertNo: "",
    principalAmount: "",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    maturityDate: "",
    maturityAmount: "",
    status: "Active",
    notes: ""
  });

  const token = localStorage.getItem("token");

  // Fetch Investments from Backend
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Button Click Handler (SUPER_ADMIN না হলে ব্লক করবে)
  const handleAddClick = () => {
    if (!isSuperAdmin) {
      toast.error("Access Denied! Only SUPER_ADMIN can add new investments.");
      return;
    }
    setIsEditMode(false);
    setSelectedInvestmentId(null);
    setFormData({
      investmentType: "FDR",
      institutionName: "",
      accountOrCertNo: "",
      principalAmount: "",
      interestRate: "",
      startDate: new Date().toISOString().split("T")[0],
      maturityDate: "",
      maturityAmount: "",
      status: "Active",
      notes: ""
    });
    setIsModalOpen(true);
  };

  // Edit Button Click Handler
  const handleEditClick = (item) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied! Only SUPER_ADMIN can edit investments.");
      return;
    }
    setIsEditMode(true);
    setSelectedInvestmentId(item._id);
    setFormData({
      investmentType: item.investmentType || "FDR",
      institutionName: item.institutionName || "",
      accountOrCertNo: item.accountOrCertNo || "",
      principalAmount: item.principalAmount || "",
      interestRate: item.interestRate || "",
      startDate: item.startDate ? item.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      maturityDate: item.maturityDate ? item.maturityDate.split("T")[0] : "",
      maturityAmount: item.maturityAmount || "",
      status: item.status || "Active",
      notes: item.notes || ""
    });
    setIsModalOpen(true);
  };

  // Delete Handler
  const handleDeleteClick = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied! Only SUPER_ADMIN can delete investments.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        await axios.delete(`${API_BASE_URL}/investments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Investment deleted successfully!");
        fetchInvestments();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete investment");
      }
    }
  };

  // Handle Submit to Backend (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Access Denied! Only SUPER_ADMIN can perform this action.");
      return;
    }
    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/investments/${selectedInvestmentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Investment updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/investments`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Investment added successfully!");
      }
      
      setIsModalOpen(false);
      setFormData({
        investmentType: "FDR",
        institutionName: "",
        accountOrCertNo: "",
        principalAmount: "",
        interestRate: "",
        startDate: new Date().toISOString().split("T")[0],
        maturityDate: "",
        maturityAmount: "",
        status: "Active",
        notes: ""
      });
      fetchInvestments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Filtered Investments based on Institution Name or Type
  const filteredInvestments = investments.filter(item =>
    (item.institutionName && item.institutionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.investmentType && item.investmentType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Summary Calculations
  const totalInvested = investments.reduce((acc, item) => acc + Number(item.principalAmount || 0), 0);
  const activeProjectsCount = investments.filter(item => item.status === "Active").length;
  const totalMaturity = investments.reduce((acc, item) => acc + Number(item.maturityAmount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FaPiggyBank />
            </span>
            Investment Management (FDR / DPS)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and track all cooperative investments, FDR, DPS, Property, and returns.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 cursor-pointer transition-all duration-300"
          >
            <FaPlus /> Add New Investment
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Invested</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">৳ {totalInvested.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-xl">
            <FaBuilding />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Investments</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{activeProjectsCount} Active</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl text-xl">
            <FaCalendarAlt />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Expected Maturity Amount</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">৳ {totalMaturity.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center gap-3">
        <FaSearch className="text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by institution name or type (FDR/DPS/Property)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-sm font-medium"
        />
      </div>

      {/* Investments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Type & A/C No</th>
                <th className="p-4">Institution Name</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Principal Amount</th>
                <th className="p-4">Interest Rate</th>
                <th className="p-4">Maturity Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredInvestments.length > 0 ? (
                filteredInvestments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{item.investmentType}</span>
                      <span className="text-xs text-slate-400">{item.accountOrCertNo}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{item.institutionName}</td>
                    <td className="p-4 text-slate-500">{new Date(item.startDate).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-800">৳ {Number(item.principalAmount).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-blue-600">{item.interestRate ? `${item.interestRate}%` : 'N/A'}</td>
                    <td className="p-4 font-bold text-emerald-600">৳ {Number(item.maturityAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        item.status === "Active" 
                          ? "bg-amber-50 text-amber-600 border border-amber-200/50" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                      }`}>
                        {item.status === "Active" ? <FaCheckCircle /> : <FaTimesCircle />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          title="Details"
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <FaEye size={14} />
                        </button>
                        {isSuperAdmin && (
                          <>
                            <button 
                              onClick={() => handleEditClick(item)}
                              title="Edit"
                              className="text-amber-600 hover:text-amber-800 bg-amber-50 p-2 rounded-lg transition-colors"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item._id)}
                              title="Delete"
                              className="text-rose-600 hover:text-rose-800 bg-rose-50 p-2 rounded-lg transition-colors"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                    {loading ? "Loading investments..." : "No investments found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Investment Modal */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-800 mb-4">
              {isEditMode ? "Edit Investment" : "Add New Investment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Investment Type</label>
                  <select
                    name="investmentType"
                    value={formData.investmentType}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="FDR">FDR</option>
                    <option value="DPS">DPS</option>
                    <option value="Sanchaypatra">Sanchaypatra</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Land / Property">Land / Property</option>
                    <option value="Business Venture">Business Venture</option>
                    <option value="Shares">Shares</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution / Property Name</label>
                  <input
                    type="text"
                    name="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="Bank, Property or Business Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account / Cert / Deed No</label>
                  <input
                    type="text"
                    name="accountOrCertNo"
                    value={formData.accountOrCertNo}
                    onChange={handleChange}
                    placeholder="A/C, Certificate or Deed No"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Rate (%) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleChange}
                    placeholder="e.g. 9.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Principal Amount (৳)</label>
                  <input
                    type="number"
                    name="principalAmount"
                    required
                    value={formData.principalAmount}
                    onChange={handleChange}
                    placeholder="500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maturity / Current Value (৳)</label>
                  <input
                    type="number"
                    name="maturityAmount"
                    value={formData.maturityAmount}
                    onChange={handleChange}
                    placeholder="600000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maturity Date (Optional)</label>
                  <input
                    type="date"
                    name="maturityDate"
                    value={formData.maturityDate}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  {isEditMode ? "Update Investment" : "Save Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentManagement;