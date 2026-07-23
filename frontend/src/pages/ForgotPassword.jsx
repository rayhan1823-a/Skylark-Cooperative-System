import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
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
  // Send OTP
  // ==================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.email.trim() === "" &&
      formData.phone.trim() === ""
    ) {
      return alert("Enter Email or Phone Number");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/forgot-password/send-otp",
        formData
      );

      if (res.data.success) {
        alert("OTP Sent Successfully");

        navigate("/verify-otp", {
          state: {
            email: formData.email,
            phone: formData.phone,
          },
        });
      }

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to Send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Enter your Email or Phone Number
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div className="text-center mb-4 font-semibold text-gray-500">
            OR
          </div>

          {/* Phone */}

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full border rounded-lg p-3"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-5 w-full text-blue-700 hover:underline"
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}

export default ForgotPassword;