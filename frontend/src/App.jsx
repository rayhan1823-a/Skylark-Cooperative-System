import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword"; // ✅ পাসওয়ার্ড পরিবর্তনের পেজ ইম্পোর্ট করা হলো
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar"; // ✅ সাইডবার ইম্পোর্ট করা হলো (যদি অলরেডি লেআউট ফাইল থাকে তবে এটি অপশনাল)

// Home & Gallery (নতুন পেজ ইম্পোর্ট করা হলো)
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";

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
// Dashboard Layout (Sidebar Show করার জন্য)
// ======================================
function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* সাইডবার */}
      <Sidebar />
      
      {/* মেইন কন্টেন্ট এরিয়া */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

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
  // ইউজার অবজেক্ট থেকে রোল বের করা হচ্ছে রাউট প্রটেক্ট করার জন্য
  const user = JSON.parse(localStorage.getItem("user")) || {};

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
            Authentication
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
            Protected Dashboard Layout Routes (Sidebar সহ সব পেজ)
        ========================== */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Home & Dashboard */}
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Dashboard />} />

          {/* Gallery */}
          <Route path="/gallery" element={<Gallery />} />

          {/* Members & Users */}
          <Route path="/members" element={<Members />} />

          {/* ✅ Users List Route Protected for SUPER_ADMIN only */}
          <Route
            path="/users-list"
            element={user.role === "SUPER_ADMIN" ? <UsersList /> : <Navigate to="/" replace />}
          />

          <Route path="/add-member" element={<AddMember />} />
          <Route path="/edit-member/:id" element={<EditMember />} />
          <Route path="/member/:id" element={<MemberProfile />} />
          <Route path="/member-card/:id" element={<MemberIDCard />} />

          {/* Change Password */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Print Receipts */}
          <Route path="/print-receipt/:id" element={<PrintReceipt />} />
          <Route path="/loans/receipt/:id" element={<LoanReceipt />} />
          <Route path="/penalties/receipt/:id" element={<PenaltyReceipt />} />

          {/* Transactions & Funds */}
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/deposit-withdrawal" element={<DepositWithdrawal />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/penalties" element={<Penalties />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />

          {/* Settings */}
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