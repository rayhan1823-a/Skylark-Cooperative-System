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
  FaTimesCircle 
} from "react-icons/fa";

function InvestmentManagement() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Backend Model এর সাথে সামঞ্জস্য রেখে Form State আপডেট করা হলো
  const [formData, setFormData] = useState({
    investmentType: "FDR", // FDR, DPS, Sanchaypatra, Mutual Fund
    institutionName: "",
    accountOrCertNo: "",
    principalAmount: "",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    maturityDate: "",
    maturityAmount: "",
    status: "Active", // Active, Closed
    notes: ""
  });

  const token = localStorage.getItem("token");

  // Fetch Investments from Backend
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/investments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // ব্যাকএন্ড থেকে আসা ডেটা structure ({ success: true, data: [...] }) অনুযায়ী সেট করা হলো
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

  // Handle Submit to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/investments", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Investment added successfully!");
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
            Manage and track all cooperative investments, FDR, DPS, and returns.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all duration-300"
        >
          <FaPlus /> Add New Investment
        </button>
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
          placeholder="Search by institution name or type (FDR/DPS)..."
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
                    <td className="p-4 font-semibold text-blue-600">{item.interestRate}%</td>
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
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                    No investments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-800 mb-4">Add New Investment</h2>
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
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution Name</label>
                  <input
                    type="text"
                    name="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="Bank or Financial Institution"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account / Cert No</label>
                  <input
                    type="text"
                    name="accountOrCertNo"
                    required
                    value={formData.accountOrCertNo}
                    onChange={handleChange}
                    placeholder="A/C or Certificate No"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="interestRate"
                    required
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maturity Amount (৳)</label>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Maturity Date</label>
                  <input
                    type="date"
                    name="maturityDate"
                    required
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
                  Save Investment
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