import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const phone = location.state?.phone || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // ==================================
  // Handle Input
  // ==================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==================================
  // Reset Password
  // ==================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      return alert("Passwords do not match.");
    }

    if (formData.newPassword.length < 6) {
      return alert(
        "Password must be at least 6 characters."
      );
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/forgot-password/reset-password",
        {
          email,
          phone,
          newPassword: formData.newPassword,
        }
      );

      if (res.data.success) {
        alert(
          "Password Changed Successfully."
        );

        navigate("/login");
      }

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Password Reset Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Reset Password
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create Your New Password
        </p>

        <form onSubmit={handleSubmit}>

          {/* New Password */}

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter New Password"
              className="w-full border rounded-lg p-3"
              required
            />

          </div>

          {/* Confirm Password */}

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full border rounded-lg p-3"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-5 text-blue-700 hover:underline"
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}

export default ResetPassword;