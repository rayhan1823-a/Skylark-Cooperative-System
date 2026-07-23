import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ======================================
  // Already Logged In
  // ======================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ======================================
  // Login
  // ======================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://skylark-cooperative-system.onrender.com/api/auth/login",
        {
          phone,
          password,
        }
      );

      if (!res.data.success) {
        alert("Login Failed");
        return;
      }

      // টোকেন এবং ইউজার ডেটা সেভ করা হচ্ছে
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // রোল এবং আইডি লোকাল স্টোরেজে সেভ করা (নতুন সংযোজন)
      const userData = res.data.user || {};
      const userRole = res.data.role || userData.role || "member"; 
      const userId = res.data.memberId || userData.memberId || userData._id || "";

      localStorage.setItem("role", userRole); // "admin" বা "member"
      localStorage.setItem("memberId", userId); // ইউজারের নিজস্ব আইডি

      alert("Login Successful");

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-cyan-500 flex items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            Skylark Cooperative
          </h1>
          <p className="text-gray-500 mt-2">
            Management System
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="01XXXXXXXXX"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block mb-2 font-medium">
              Password
            </label>
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="********"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Show Password */}
          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() =>
                  setShowPassword(!showPassword)
                }
              />
              Show Password
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;