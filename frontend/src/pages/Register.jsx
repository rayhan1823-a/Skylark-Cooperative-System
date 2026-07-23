import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // আপনার ব্যাকএন্ডের রেজিস্টার এপিআই কল
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);

      if (res.data.success) {
        toast.success("Registration Successful!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Register</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name</label>
            <input type="text" name="name" onChange={handleChange} placeholder="Enter your name" className="w-full border rounded-lg p-3" required />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Phone Number</label>
            <input type="text" name="phone" onChange={handleChange} placeholder="01XXXXXXXXX" className="w-full border rounded-lg p-3" required />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Email</label>
            <input type="email" name="email" onChange={handleChange} placeholder="email@example.com" className="w-full border rounded-lg p-3" />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Password</label>
            <input type="password" name="password" onChange={handleChange} placeholder="Enter password" className="w-full border rounded-lg p-3" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-700 hover:underline">Login</button>
        </p>
      </div>
    </div>
  );
}

export default Register;