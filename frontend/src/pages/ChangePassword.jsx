import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("❌ New password and Confirm password do not match!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");

      await axios.put(
        "https://skylark-cooperative-system.onrender.com/api/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      const errorMsg = error.response?.data?.message || "Failed to change password. Check your old password.";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow mt-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter old password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}

export default ChangePassword;