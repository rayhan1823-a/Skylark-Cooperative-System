import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

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
      // ইউজার রোল লোকালস্টোরেজ থেকে চেক করা হচ্ছে
      const userStr = localStorage.getItem("user");
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

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API}/members`, getAuthHeader());
      setMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API}/loans`, getAuthHeader());
      setLoans(res.data.loans || []);
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
    if (!isSuperAdmin && editingId) {
      alert("Only Super Admin can update loans.");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API}/loans/${editingId}`, formData, getAuthHeader());
        alert("Loan Updated Successfully");
      } else {
        await axios.post(`${API}/loans`, formData, getAuthHeader());
        alert("Loan Added Successfully");
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
      alert(err.response?.data?.message || "Operation Failed");
    }
  };

  const handleEdit = (loan) => {
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin can edit loan records.");
      return;
    }
    setEditingId(loan._id);
    setFormData({
      member: loan.member?._id || "",
      amount: loan.amount,
      issueDate: loan.issueDate ? loan.issueDate.split("T")[0] : "",
      dueDate: loan.dueDate ? loan.dueDate.split("T")[0] : "",
      remarks: loan.remarks,
      status: loan.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this loan?")) return;
    try {
      await axios.delete(`${API}/loans/${id}`, getAuthHeader());
      alert("Loan Deleted");
      fetchLoans();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const filteredLoans = loans.filter((loan) => {
    return (
      loan.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
      loan.member?.memberId?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <MainLayout>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Loan Management</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <select name="member" value={formData.member} onChange={handleChange} className="border rounded-lg p-3" required>
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.memberId} - {member.name}
              </option>
            ))}
          </select>
          <input type="number" name="amount" placeholder="Loan Amount" value={formData.amount} onChange={handleChange} className="border rounded-lg p-3" required />
          <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="border rounded-lg p-3" />
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="border rounded-lg p-3" required />
          <select name="status" value={formData.status} onChange={handleChange} className="border rounded-lg p-3">
            <option value="Running">Running</option>
            <option value="Paid">Paid</option>
          </select>
          <input type="text" name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="border rounded-lg p-3" />
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
              {editingId ? "Update Loan" : "Add Loan"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <input type="text" placeholder="Search Member..." className="border rounded-lg p-3 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Member</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Issue Date</th>
                <th className="border p-2">Due Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Receipt No</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, index) => {
                const serialNum = String(index + 1).padStart(6, '0');
                const receiptText = loan.receiptNo || `SKY-LOAN-${serialNum}`;

                return (
                  <tr key={loan._id}>
                    <td className="border p-2">{loan.member?.memberId}<br />{loan.member?.name}</td>
                    <td className="border p-2">৳ {loan.amount}</td>
                    <td className="border p-2">{new Date(loan.issueDate).toLocaleDateString()}</td>
                    <td className="border p-2">{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td className="border p-2">
                      <span className={loan.status === "Paid" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{loan.status}</span>
                    </td>
                    <td className="border p-2">
                      <span 
                        onClick={() => navigate(`/loans/receipt/${loan._id}`, { state: { loan, receiptNo: receiptText } })} 
                        className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md font-bold text-sm hover:bg-blue-100 cursor-pointer inline-block shadow-sm"
                      >
                        {receiptText}
                      </span>
                    </td>
                    <td className="border p-2">
                      <button 
                        onClick={() => handleEdit(loan)} 
                        disabled={!isSuperAdmin}
                        className={`px-3 py-1 rounded mr-2 text-white ${
                          isSuperAdmin 
                            ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer" 
                            : "bg-gray-400 cursor-not-allowed opacity-60"
                        }`}
                        title={!isSuperAdmin ? "Only Super Admin can edit loans" : ""}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(loan._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Loans;