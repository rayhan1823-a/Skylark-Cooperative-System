import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function Settings() {
  const API = "https://skylark-cooperative-system.onrender.com/api";

  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  // পাসওয়ার্ড পরিবর্তনের স্টেট
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // স্টাফ যোগ করার স্টেট
  const [staffData, setStaffData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "STAFF"
  });

  // =====================================
  // Download Backup
  // =====================================
  const downloadBackup = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/backup/export`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `backup-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.zip`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Backup Download Successful");
    } catch (err) {
      console.log("DOWNLOAD ERROR", err);
      toast.error(err.response?.data?.message || err.message || "Backup Download Failed");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Restore Backup
  // =====================================
  const restoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ok = window.confirm(
      "Are you sure you want to restore this backup?\n\nCurrent database will be replaced."
    );

    if (!ok) {
      fileRef.current.value = "";
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("backup", file);
      const response = await axios.post(`${API}/backup/restore`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
    } catch (err) {
      console.log("RESTORE ERROR", err);
      toast.error(err.response?.data?.message || err.message || "Restore Failed");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // =====================================
  // Change Password Handle
  // =====================================
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${API}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Add Staff Handle (Super Admin Only)
  // =====================================
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/users`,
        staffData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Staff added successfully");
      setStaffData({ name: "", phone: "", email: "", password: "", role: "STAFF" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Logout
  // =====================================
  const logout = () => {
    if (!window.confirm("Logout এখন করবেন?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logout Successful");
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">Account Information</h2>
          <div className="space-y-3">
            <p><b>Name :</b> {user.name || "N/A"}</p>
            <p><b>Phone :</b> {user.phone || "N/A"}</p>
            <p><b>Email :</b> {user.email || "rayhan444424@gmail.com"}</p>
            <p><b>Role :</b> {user.role || "N/A"}</p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Add Staff Card (Visible only for SUPER_ADMIN) */}
        {user.role === "SUPER_ADMIN" && (
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-5">Add New Staff / User</h2>
            <form onSubmit={handleAddStaff} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={staffData.name}
                onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={staffData.phone}
                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={staffData.email}
                onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="password"
                placeholder="Password"
                value={staffData.password}
                onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
                className="border p-3 rounded-lg w-full"
                required
              />
              <select
                value={staffData.role}
                onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                className="border p-3 rounded-lg w-full md:col-span-2"
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Database Backup */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">Database Backup</h2>
          <p className="text-gray-500 mb-5">Download encrypted ZIP backup.</p>
          <button
            onClick={downloadBackup}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Please Wait..." : "Download Backup"}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-5">Restore Backup</h2>
          <p className="text-gray-500 mb-5">Upload ZIP backup file.</p>
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            onChange={restoreBackup}
            className="border p-3 rounded-lg w-full"
          />
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-5">System Information</h2>
          <div className="space-y-3">
            <p><b>Software :</b> Skylark Cooperative Management System</p>
            <p><b>Version :</b> 1.0.0</p>
            <p><b>Developer :</b> MD Rayhan Habib</p>
            <p>
              <b>Status :</b>{" "}
              <span className="text-green-600 font-semibold">Running</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;