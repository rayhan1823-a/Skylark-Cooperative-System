import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ রিডাইরেক্ট করার জন্য ইম্পোর্ট করা হলো
import { toast } from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";

const API_URL = "https://skylark-cooperative-system.onrender.com";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ হুুক ডিফাইন করা হলো

  useEffect(() => {
    // ==========================
    // Security Role Check
    // ==========================
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = storedUser.role || "";
      
      // যদি ইউজার ADMIN বা SUPER_ADMIN না হয়, তবে তাকে ড্যাশবোর্ডে পাঠিয়ে দেওয়া হবে
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        toast.error("Access Denied! Only admins can view registered users.");
        navigate("/");
        return;
      }
    } catch (e) {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [navigate]);

  // ==========================
  // Fetch Registered Users
  // ==========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      // ব্যাকএন্ডের ইউজার লিস্ট পাওয়ার এন্ডপয়েন্ট
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setUsers(res.data.users || res.data.data || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load registered users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Search Filtering Logic
  // ==========================
  const filteredUsers = users.filter((user) => {
    const text = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(text) ||
      user.phone?.includes(text) ||
      user.email?.toLowerCase().includes(text) ||
      user.role?.toLowerCase().includes(text)
    );
  });

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registered Users</h1>
          <p className="text-gray-500 text-sm mt-1">সিস্টেমে যারা অ্যাকাউন্ট বা রেজিস্ট্রেশন করেছে তাদের তালিকা</p>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Name, Phone, Email or Role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
      />

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4 font-semibold text-center">SL</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold text-center">Role</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 font-medium">
                  Loading Registered Users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id || index} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-center text-gray-700">{index + 1}</td>
                  <td className="p-4 font-semibold text-gray-800">{user.name || "N/A"}</td>
                  <td className="p-4 text-gray-600">{user.phone || user.phoneNumber || "N/A"}</td>
                  <td className="p-4 text-gray-600">{user.email || "N/A"}</td>
                  
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {user.role || "MEMBER"}
                    </span>
                  </td>
                  
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        user.status === "Inactive" ? "bg-gray-500" : "bg-green-600"
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 font-medium">
                  No Registered Users Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default UsersList;