import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import { FaWallet, FaHistory, FaTrash } from "react-icons/fa";

function DepositWithdrawal() {
  const [members, setMembers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  // Form states
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchMembers();
    fetchWithdrawals();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.members || res.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/withdrawals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.withdrawals || [];
      setWithdrawals(data);

      // Calculate total withdrawn amount
      const total = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      setTotalWithdrawn(total);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !amount) {
      alert("Please select a member and enter an amount.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        memberId: selectedMember,
        amount: Number(amount),
        date,
        note,
      };

      const res = await axios.post("http://localhost:5000/api/withdrawals", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Withdrawal recorded successfully!");
        setSelectedMember("");
        setAmount("");
        setNote("");
        setDate(new Date().toISOString().split("T")[0]);
        fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error recording withdrawal:", error);
      alert(error.response?.data?.message || "Failed to record withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  // Delete withdrawal (Super Admin only)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this withdrawal?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`http://localhost:5000/api/withdrawals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          alert("Withdrawal deleted successfully!");
          fetchWithdrawals();
        }
      } catch (error) {
        console.error("Error deleting withdrawal:", error);
        alert(error.response?.data?.message || "Failed to delete withdrawal.");
      }
    }
  };

  const userRole = localStorage.getItem("role") || "SUPER_ADMIN";

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Total Withdrawn Amount Card */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Withdrawn Amount</p>
            <h2 className="text-4xl font-extrabold mt-1">৳ {totalWithdrawn.toLocaleString()}</h2>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <FaWallet className="text-3xl text-white" />
          </div>
        </div>

        {/* Withdrawal Form Section */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-10 border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
              <FaWallet className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Deposit Withdrawal</h2>
              <p className="text-sm text-gray-500">Securely process savings withdrawals for members</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Select Member */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- Select Member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.memberId})
                  </option>
                ))}
              </select>
            </div>

            {/* Withdraw Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Withdraw Amount (৳)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Withdrawal Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Withdrawal Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Note / Reason */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note / Reason (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Emergency medical withdrawal"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:from-pink-700 hover:to-rose-700 transition duration-200"
              >
                {loading ? "Processing..." : "Confirm & Withdraw Money"}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Withdrawal History Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <FaHistory className="text-blue-600 text-xl" />
            <h3 className="text-xl font-bold text-gray-800">Recent Withdrawal History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Receipt No</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Member Name</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Note</th>
                  {userRole === "SUPER_ADMIN" && (
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 text-sm">
                {withdrawals.length > 0 ? (
                  withdrawals.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-50 transition">
                      {/* Receipt No Click to Print */}
                      <td className="py-4 px-4 font-bold text-blue-600">
                        <button
                          onClick={() => {
                            const printWindow = window.open('', '_blank', 'width=800,height=700');
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Withdrawal Receipt - ${item.receiptNo || "SKY-DW-000001"}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: #fff; }
                                    .receipt-box { max-width: 650px; margin: auto; border: 2px solid #1e3a8a; padding: 30px; border-radius: 12px; position: relative; }
                                    
                                    /* Header & Logo Alignment */
                                    .header { text-align: center; margin-bottom: 20px; }
                                    .logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 8px; }
                                    h2 { color: #1e3a8a; margin: 0; font-size: 22px; }
                                    h3 { color: #4b5563; margin: 5px 0 0 0; font-size: 14px; font-weight: normal; }
                                    hr { border: 0; border-top: 1px solid #d1d5db; margin: 15px 0; }

                                    /* Table-like Grid Alignment for Details to prevent overlapping */
                                    .details-grid {
                                      display: grid;
                                      grid-template-columns: 160px 1fr;
                                      gap: 12px 15px;
                                      font-size: 15px;
                                      align-items: center;
                                      margin-top: 15px;
                                    }
                                    .label { font-weight: bold; color: #374151; }
                                    .value { color: #111827; }

                                    /* Footer & Signatures */
                                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; }
                                    .sig-box { text-align: center; font-size: 14px; font-weight: bold; }
                                    .sig-img { width: 110px; height: 45px; object-fit: contain; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto; }
                                    .sig-line { border-top: 1px dashed #333; width: 160px; margin-top: 5px; padding-top: 4px; }
                                  </style>
                                </head>
                                <body>
                                  <div class="receipt-box">
                                    <!-- Header with Logo -->
                                    <div class="header">
                                      <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'" />
                                      <h2>Skylark Cooperative Society</h2>
                                      <h3>Withdrawal Money Receipt</h3>
                                    </div>
                                    <hr/>

                                    <!-- Perfectly Aligned Details Grid -->
                                    <div class="details-grid">
                                      <div class="label">Receipt No:</div>
                                      <div class="value" style="font-weight: bold; color: #2563eb;">${item.receiptNo || "SKY-DW-000001"}</div>

                                      <div class="label">Date:</div>
                                      <div class="value">${item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</div>

                                      <div class="label">Member Name:</div>
                                      <div class="value">${item.member?.name || "N/A"}</div>

                                      <div class="label">Member ID:</div>
                                      <div class="value">${item.member?.memberId || "N/A"}</div>

                                      <div class="label">Withdrawn Amount:</div>
                                      <div class="value" style="color: #dc2626; font-weight: bold;">৳ ${Number(item.amount).toLocaleString()}</div>

                                      <div class="label">Note / Reason:</div>
                                      <div class="value">${item.note || "N/A"}</div>
                                    </div>

                                    <!-- Footer with Signatures -->
                                    <div class="footer">
                                      <div class="sig-box">
                                        <div style="height: 45px;"></div>
                                        <div class="sig-line">Member Signature</div>
                                      </div>
                                      <div class="sig-box">
                                        <img src="/signature.png" alt="Authorized Signature" class="sig-img" onerror="this.style.display='none'" />
                                        <div class="sig-line">Authorized Signature</div>
                                      </div>
                                    </div>
                                  </div>
                                  <script>
                                    window.onload = function() {
                                      window.print();
                                    };
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="hover:underline bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 cursor-pointer"
                          title="Click to print receipt"
                        >
                          {item.receiptNo || "SKY-DW-000001"}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {item.member?.name || "Unknown Member"}
                      </td>
                      <td className="py-4 px-4 font-bold text-red-600">
                        ৳ {Number(item.amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 italic text-gray-500">
                        {item.note || "No note provided"}
                      </td>

                      {/* Delete button visible ONLY for Super Admin */}
                      {userRole === "SUPER_ADMIN" && (
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto shadow"
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userRole === "SUPER_ADMIN" ? "6" : "5"} className="text-center py-8 text-gray-400">
                      No withdrawal records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default DepositWithdrawal;