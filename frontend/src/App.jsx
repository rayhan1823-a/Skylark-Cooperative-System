import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword"; // ✅ পাসওয়ার্ড পরিবর্তনের পেজ ইম্পোর্ট করা হলো
import ProtectedRoute from "./components/ProtectedRoute";

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
            Home & Dashboard
        ========================== */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Gallery
        ========================== */}

        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Members & Users
        ========================== */}

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        {/* ✅ Users List Route Protected for SUPER_ADMIN only */}
        <Route
          path="/users-list"
          element={
            <ProtectedRoute>
              {user.role === "SUPER_ADMIN" ? <UsersList /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-member"
          element={
            <ProtectedRoute>
              <AddMember />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-member/:id"
          element={
            <ProtectedRoute>
              <EditMember />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/:id"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member-card/:id"
          element={
            <ProtectedRoute>
              <MemberIDCard />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Change Password (ProtectedRoute সহ)
        ========================== */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Print Receipts
        ========================== */}

        <Route
          path="/print-receipt/:id"
          element={
            <ProtectedRoute>
              <PrintReceipt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans/receipt/:id"
          element={
            <ProtectedRoute>
              <LoanReceipt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/penalties/receipt/:id"
          element={
            <ProtectedRoute>
              <PenaltyReceipt />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Transactions & Funds
        ========================== */}

        <Route
          path="/deposits"
          element={
            <ProtectedRoute>
              <Deposits />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deposit-withdrawal"
          element={
            <ProtectedRoute>
              <DepositWithdrawal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/funds"
          element={
            <ProtectedRoute>
              <Funds />
            </ProtectedRoute>
          }
        />

        <Route
          path="/penalties"
          element={
            <ProtectedRoute>
              <Penalties />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Reports
        ========================== */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Settings
        ========================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Redirect & 404
        ========================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;