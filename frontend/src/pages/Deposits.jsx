import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API = "https://skylark-cooperative-system.onrender.com/api";

function Deposits() {
  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // আজকের তারিখ YYYY-MM-DD ফরম্যাটে নেওয়ার জন্য
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [members, setMembers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    month: new Date().toLocaleString("default", {
      month: "long",
    }),
    year: new Date().getFullYear(),
    depositDate: getTodayDate(),
    paymentMethod: "Cash",
    note: "", // নোট ফিল্ড যোগ করা হলো
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchMembers();
    fetchDeposits();
    checkUserRole();
  }, []);

  // ============================
  // Check User Role (SUPER_ADMIN)
  // ============================
  const checkUserRole = () => {
    try {
      const userStr = localStorage.getItem("user");
      const roleStr = localStorage.getItem("role");

      if (roleStr === "SUPER_ADMIN") {
        setIsSuperAdmin(true);
        return;
      }

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "SUPER_ADMIN" || user.isSuperAdmin === true) {
          setIsSuperAdmin(true);
        }
      }
    } catch (err) {
      console.error("Role check error:", err);
    }
  };

  // ============================
  // Fetch Members
  // ============================
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API}/members`, getConfig());
      setMembers(res.data.members || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load members");
    }
  };

  // ============================
  // Fetch Deposits
  // ============================
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/deposits`, getConfig());
      setDeposits(res.data.deposits || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Handle Input
  // ============================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ============================
  // Search Filter
  // ============================
  const filteredDeposits = deposits.filter((deposit) => {
    const keyword = search.toLowerCase();
    return (
      deposit.memberId?.memberId?.toLowerCase().includes(keyword) ||
      deposit.memberId?.name?.toLowerCase().includes(keyword) ||
      deposit.receiptNo?.toLowerCase().includes(keyword) ||
      deposit.note?.toLowerCase().includes(keyword)
    );
  });

  // ============================
  // Save Deposit
  // ============================
  const saveDeposit = async () => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can add deposits.");
      return;
    }

    if (!formData.memberId) {
      toast.error("Please Select Member");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please Enter Valid Amount");
      return;
    }

    if (!formData.depositDate) {
      toast.error("Please Select Deposit Date");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/deposits`,
        {
          memberId: formData.memberId,
          amount: Number(formData.amount),
          month: formData.month,
          year: Number(formData.year),
          depositDate: formData.depositDate,
          paymentMethod: formData.paymentMethod,
          note: formData.note,
        },
        getConfig()
      );

      toast.success("Deposit Added Successfully");

      setFormData({
        memberId: "",
        amount: "",
        month: new Date().toLocaleString("default", {
          month: "long",
        }),
        year: new Date().getFullYear(),
        depositDate: getTodayDate(),
        paymentMethod: "Cash",
        note: "",
      });

      fetchDeposits();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Deposit Failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Delete Deposit
  // ============================
  const deleteDeposit = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can delete records.");
      return;
    }

    if (!window.confirm("Delete this Deposit?")) return;

    try {
      await axios.delete(`${API}/deposits/${id}`, getConfig());
      toast.success("Deposit Deleted");
      fetchDeposits();
    } catch (error) {
      console.error(error);
      toast.error("Delete Failed");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Deposit Management</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-5">Add New Deposit</h2>

        {/* 1st Row: Member, Amount, Receipt No */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Member */}
          <div>
            <label className="font-semibold">Member</label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.memberId} - {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="font-semibold">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          {/* Receipt */}
          <div>
            <label className="font-semibold">Receipt No</label>
            <input
              type="text"
              value="Auto Generate"
              disabled
              className="border rounded-lg p-3 w-full bg-gray-100"
            />
          </div>
        </div>

        {/* 2nd Row: Month, Year, Deposit Date */}
        <div className="grid md:grid-cols-3 gap-5 mt-4">
          {/* Month */}
          <div>
            <label className="font-semibold">Month</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="font-semibold">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          {/* Deposit Date */}
          <div>
            <label className="font-semibold text-blue-600">Deposit Date</label>
            <input
              type="date"
              name="depositDate"
              value={formData.depositDate}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-white border-blue-400 focus:outline-blue-600"
            />
          </div>
        </div>

        {/* 3rd Row: Note Input Field */}
        <div className="mt-4">
          <label className="font-semibold">Note / Remark (Optional)</label>
          <input
            type="text"
            name="note"
            placeholder="Write a note about this deposit..."
            value={formData.note}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <button
          onClick={saveDeposit}
          disabled={loading || !isSuperAdmin}
          title={!isSuperAdmin ? "Only Super Admin can add deposits" : ""}
          className={`mt-6 px-8 py-3 rounded-lg text-white font-semibold transition ${
            isSuperAdmin
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }`}
        >
          {loading ? "Saving..." : "💾 Save Deposit"}
        </button>
      </div>

      {/* ========================= */}
      {/* Deposit History */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow mt-8">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-bold">Deposit History</h2>
          <input
            type="text"
            placeholder="Search Member / Receipt / Note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg p-2 w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">SL</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Receipt</th>
                <th>Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              ) : filteredDeposits.length > 0 ? (
                filteredDeposits.map((deposit, index) => (
                  <tr key={deposit._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td>
                      <div className="font-semibold">
                        {deposit.memberId?.memberId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {deposit.memberId?.name}
                      </div>
                    </td>
                    <td>৳ {Number(deposit.amount).toLocaleString()}</td>
                    <td>{deposit.month}</td>
                    <td>{deposit.year}</td>
                    <td>
                      <span className="font-semibold text-blue-600">
                        {deposit.receiptNo}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {deposit.note || "---"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteDeposit(deposit._id)}
                        className={`px-3 py-1 rounded text-white ${
                          isSuperAdmin
                            ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                            : "bg-gray-400 cursor-not-allowed opacity-70"
                        }`}
                        title={!isSuperAdmin ? "Only Super Admin can delete deposits" : ""}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500">
                    No Deposit Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Deposits;