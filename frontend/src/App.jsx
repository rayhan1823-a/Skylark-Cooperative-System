import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";

// MainLayout সঠিক পাথ থেকে ইম্পোর্ট করা হলো (layouts ফোল্ডার থেকে)
import MainLayout from "./layouts/MainLayout"; 

// Home & Notice Pages
import Home from "./pages/Home";
import Notice from "./pages/Notice";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Members & Users List
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import EditMember from "./pages/EditMember";
import MemberProfile from "./pages/MemberProfile";
import MemberIDCard from "./pages/MemberIDCard";
import UsersList from "./pages/UsersList"; 

// Print Receipt
import PrintReceipt from "./pages/PrintReceipt";
import LoanReceipt from "./pages/LoanReceipt"; 
import PenaltyReceipt from "./pages/PenaltyReceipt";

// Transactions & Withdrawals
import Deposits from "./pages/Deposits";
import DepositWithdrawal from "./pages/DepositWithdrawal";
import Payments from "./pages/Payments";
import Loans from "./pages/Loans";
import Funds from "./pages/Funds"; 
import Penalties from "./pages/Penalties";

// Reports
import Reports from "./pages/Reports";

// Settings
import Settings from "./pages/Settings";

// ======================================
// 404 Page
// ======================================
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <p className="text-gray-600 mt-3 text-lg">Page Not Found</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  const token = localStorage.getItem("token");
  
  // সেফটি চেক সহ লোকাল স্টোরেজ থেকে ইউজার রোল রিড করা
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };
  
  const user = getUserData();
  const userRole = localStorage.getItem("role") || user.role || "";

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "15px",
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <Routes>
        {/* ==========================
            Authentication Routes (Without Sidebar/MainLayout)
        ========================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={token ? <Navigate to="/" replace /> : <ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={token ? <Navigate to="/" replace /> : <VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={token ? <Navigate to="/" replace /> : <ResetPassword />}
        />

        {/* ==========================
            Protected MainLayout Routes (With Sidebar + Header + Content)
        ========================== */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* MainLayout এর ভেতরে Outlet হিসেবে এই পেজগুলো রেন্ডার হবে */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/members" element={<Members />} />
          <Route
            path="/users-list"
            element={userRole === "SUPER_ADMIN" ? <UsersList /> : <Navigate to="/" replace />}
          />
          <Route path="/add-member" element={<AddMember />} />
          <Route path="/edit-member/:id" element={<EditMember />} />
          <Route path="/member/:id" element={<MemberProfile />} />
          <Route path="/member-card/:id" element={<MemberIDCard />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/print-receipt/:id" element={<PrintReceipt />} />
          <Route path="/loans/receipt/:id" element={<LoanReceipt />} />
          <Route path="/penalties/receipt/:id" element={<PenaltyReceipt />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/deposit-withdrawal" element={<DepositWithdrawal />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/penalties" element={<Penalties />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* ==========================
            Redirect & 404
        ========================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;