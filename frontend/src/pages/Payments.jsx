import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-hot-toast";

function Payments() {
  const API = "https://skylark-cooperative-system.onrender.com/api";

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // ===============================
  // States
  // ===============================

  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    member: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    remarks: "",
    penaltyWaiver: false,
    receivedBy: "Admin"
  });

  // ===============================
  // Load Data & Check Role
  // ===============================

  useEffect(() => {
    fetchMembers();
    fetchPayments();
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    try {
      const userStr = localStorage.getItem("user");
      const r = localStorage.getItem("role");

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "SUPER_ADMIN" || user.isSuperAdmin === true || r === "SUPER_ADMIN" || localStorage.getItem("isSuperAdmin") === "true") {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } else if (r === "SUPER_ADMIN" || localStorage.getItem("isSuperAdmin") === "true") {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Role check error:", err);
      setIsSuperAdmin(false);
    }
  };

  // ===============================
  // Fetch Members
  // ===============================

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${API}/members`,
        axiosConfig
      );

      setMembers(
        res.data.members || []
      );
    } catch (error) {
      console.log(
        "Member Load Error:",
        error
      );
    }
  };

  // ===============================
  // Fetch Payments
  // ===============================

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/payments`,
        axiosConfig
      );

      setPayments(
        res.data.payments || []
      );
    } catch (error) {
      console.log(
        "Payment Load Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Input Change
  // ===============================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value
    });
  };

  // ===============================
  // Save / Update Payment
  // ===============================

  const savePayment = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      toast.error(editingId ? "Access Denied: Only Super Admin can update payments." : "Access Denied: Only Super Admin can add payments.");
      return;
    }

    try {
      if (
        !formData.member ||
        !formData.amount
      ) {
        toast.error("Member and Amount Required");
        return;
      }

      if (editingId) {
        await axios.put(
          `${API}/payments/${editingId}`,
          formData,
          axiosConfig
        );
        toast.success("Payment Updated Successfully");
      } else {
        await axios.post(
          `${API}/payments`,
          formData,
          axiosConfig
        );
        toast.success("Payment Added Successfully");
      }

      setEditingId(null);
      setFormData({
        member: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        remarks: "",
        penaltyWaiver: false,
        receivedBy: "Admin"
      });

      fetchPayments();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Operation Failed"
      );
    }
  };

  // ===============================
  // Edit Payment Handler
  // ===============================

  const handleEdit = (payment) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can edit payment records.");
      return;
    }

    setEditingId(payment._id);
    setFormData({
      member: payment.member?._id || "",
      amount: payment.amount,
      paymentDate: payment.paymentDate ? payment.paymentDate.split("T")[0] : "",
      paymentMethod: payment.paymentMethod || "Cash",
      remarks: payment.remarks || "",
      penaltyWaiver: payment.penaltyWaiver || false,
      receivedBy: payment.receivedBy || "Admin"
    });
  };

  // ===============================
  // Delete Payment
  // ===============================

  const deletePayment = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can delete payments.");
      return;
    }

    if (
      !window.confirm(
        "Delete this payment?"
      )
    )
      return;

    try {
      await axios.delete(
        `${API}/payments/${id}`,
        axiosConfig
      );

      toast.success(
        "Payment Deleted"
      );

      fetchPayments();
    } catch (error) {
      console.log(error);
      toast.error(
        "Delete Failed"
      );
    }
  };

  // ===============================
  // Search Filter
  // ===============================

  const filteredPayments = payments.filter(
    (payment) =>
      payment.member?.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
      ||
      payment.member?.memberId
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  return (
    <MainLayout>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Payment Collection
          </h1>

          <input
            type="text"
            placeholder="Search Member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-72"
          />
        </div>

        {/* ===========================
        Payment Form
        =========================== */}

        <form
          onSubmit={savePayment}
          className="grid md:grid-cols-2 gap-5"
        >
          <div>
            <label className="font-semibold">
              Member
            </label>
            <select
              name="member"
              value={formData.member}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              required
            >
              <option value="">
                Select Member
              </option>
              {
                members.map(member => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.memberId} - {member.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              required
            />
          </div>

          <div>
            <label className="font-semibold">
              Payment Date
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          <div>
            <label className="font-semibold">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold">
              Remarks
            </label>
            <textarea
              rows="3"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="penaltyWaiver"
                checked={formData.penaltyWaiver}
                onChange={handleChange}
              />
              Penalty Waiver
            </label>
          </div>

          <div>
            <label className="font-semibold">
              Received By
            </label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!isSuperAdmin}
              className={`px-8 py-3 rounded-lg text-white font-semibold transition ${
                isSuperAdmin
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={!isSuperAdmin ? "Only Super Admin can add/update payments" : ""}
            >
              {editingId ? "Update Payment" : "Save Payment"}
            </button>
          </div>
        </form>
      </div>

      {/* ===========================
      Payment History
      =========================== */}

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-5">
          Payment History
        </h2>

        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">SL</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Received By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              loading ?
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-5"
                  >
                    Loading...
                  </td>
                </tr>
                :
                filteredPayments.length > 0 ?
                  filteredPayments.map((payment, index) => (
                    <tr
                      key={payment._id}
                      className="border-b"
                    >
                      <td className="p-3">
                        {index + 1}
                      </td>
                      <td>
                        <b>
                          {payment.member?.memberId}
                        </b>
                        <br />
                        {payment.member?.name}
                      </td>
                      <td>
                        ৳ {payment.amount}
                      </td>
                      <td>
                        {
                          new Date(payment.paymentDate)
                            .toLocaleDateString()
                        }
                      </td>
                      <td>
                        {payment.paymentMethod}
                      </td>
                      <td>
                        {payment.receivedBy}
                      </td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          disabled={!isSuperAdmin}
                          className={`px-3 py-1 rounded text-white ${
                            isSuperAdmin
                              ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                              : "bg-gray-400 cursor-not-allowed opacity-60"
                          }`}
                          title={!isSuperAdmin ? "Only Super Admin can edit payments" : ""}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePayment(payment._id)}
                          disabled={!isSuperAdmin}
                          className={`px-3 py-1 rounded text-white ${
                            isSuperAdmin
                              ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                              : "bg-gray-400 cursor-not-allowed opacity-60"
                          }`}
                          title={!isSuperAdmin ? "Only Super Admin can delete payments" : ""}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                  :
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center p-5"
                    >
                      No Payment Found
                    </td>
                  </tr>
            }
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Payments;