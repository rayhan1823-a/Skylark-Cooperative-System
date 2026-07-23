import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import { Wallet, PlusCircle, Calendar, DollarSign, Layers } from "lucide-react";

const API = "https://skylark-cooperative-system.onrender.com/api";

function DepositRates() {
  const [rates, setRates] = useState([]);

  const [formData, setFormData] = useState({
    fromYear: "",
    fromMonth: "",
    toYear: "",
    toMonth: "",
    monthlyAmount: "",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.get(
        `${API}/deposit-rates`,
        config
      );

      setRates(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveRate = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await axios.post(
        `${API}/deposit-rates`,
        formData,
        config
      );

      alert("✅ Deposit Rate Added Successfully");

      setFormData({
        fromYear: "",
        fromMonth: "",
        toYear: "",
        toMonth: "",
        monthlyAmount: "",
      });

      fetchRates();
    } catch (error) {
      console.log(error);
      alert("Failed to Save Deposit Rate");
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px] font-black tracking-widest uppercase rounded-full">
                Financial Configuration
              </span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-teal-400 via-indigo-300 to-white bg-clip-text text-transparent tracking-tight">
              Deposit Rate Management
            </h1>
            <p className="text-slate-400 mt-1 font-medium text-sm">Configure and track monthly deposit rates over specific periods</p>
          </div>
          <div className="flex items-center gap-2 bg-teal-900/40 backdrop-blur-md text-teal-300 px-4 py-2.5 rounded-2xl text-sm font-bold border border-teal-700/40 shadow-inner">
            <Wallet size={18} />
            <span>Active Rates Core</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 border border-slate-700/80 p-7 rounded-3xl shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
            <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <PlusCircle size={20} />
            </span>
            Add New Deposit Rate Period
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">From Year</label>
              <input
                type="number"
                name="fromYear"
                placeholder="e.g. 2024"
                value={formData.fromYear}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">From Month</label>
              <input
                type="number"
                name="fromMonth"
                placeholder="1 - 12"
                value={formData.fromMonth}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Year</label>
              <input
                type="number"
                name="toYear"
                placeholder="e.g. 2025"
                value={formData.toYear}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Month</label>
              <input
                type="number"
                name="toMonth"
                placeholder="1 - 12"
                value={formData.toMonth}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Amount</label>
              <input
                type="number"
                name="monthlyAmount"
                placeholder="৳ Amount"
                value={formData.monthlyAmount}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>

          </div>

          <button
            onClick={saveRate}
            className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Save Deposit Rate</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 border border-slate-700/80 p-7 rounded-3xl shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
            <span className="p-2 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Layers size={20} />
            </span>
            Existing Deposit Rate Slabs
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-200 border-b border-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-black">From Period</th>
                  <th className="p-4 font-black">To Period</th>
                  <th className="p-4 font-black">Monthly Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm font-medium text-slate-300">
                {rates.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center p-8 text-slate-500 font-bold">
                      No Deposit Rate Found
                    </td>
                  </tr>
                ) : (
                  rates.map((rate) => (
                    <tr
                      key={rate._id}
                      className="hover:bg-slate-800/60 transition"
                    >
                      <td className="p-4 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <span className="font-semibold text-white">
                          {rate.fromMonth}/{rate.fromYear}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-indigo-400" />
                          <span className="font-semibold text-white">
                            {rate.toMonth}/{rate.toYear}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-black text-emerald-400 flex items-center gap-1">
                        <DollarSign size={16} />
                        <span>৳ {Number(rate.monthlyAmount).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default DepositRates;