import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const phone = location.state?.phone || "";

  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================
  // Verify OTP
  // ==================================

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      return alert("Enter OTP");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/forgot-password/verify-otp",
        {
          email,
          phone,
          otp,
        }
      );

      if (res.data.success) {
        alert("OTP Verified Successfully");

        navigate("/reset-password", {
          state: {
            email,
            phone,
          },
        });
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "OTP Verification Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Enter the 6-digit OTP
        </p>

        <form onSubmit={handleVerify}>

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              OTP
            </label>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="123456"
              className="w-full border rounded-lg p-3 text-center text-2xl tracking-[8px]"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        <button
          onClick={() => navigate("/forgot-password")}
          className="w-full mt-5 text-blue-700 hover:underline"
        >
          Back
        </button>

      </div>

    </div>
  );
}

export default VerifyOTP;