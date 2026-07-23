import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Members
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import EditMember from "./pages/EditMember";
import MemberProfile from "./pages/MemberProfile";
import MemberIDCard from "./pages/MemberIDCard";

// Print Receipt
import PrintReceipt from "./pages/PrintReceipt";
import LoanReceipt from "./pages/LoanReceipt"; 
import PenaltyReceipt from "./pages/PenaltyReceipt"; // ✅ নতুন পেনাল্টি রিসিট পেজ ইম্পোর্ট করা হলো

// Transactions & Withdrawals
import Deposits from "./pages/Deposits";
import DepositWithdrawal from "./pages/DepositWithdrawal";
import Payments from "./pages/Payments";
import Loans from "./pages/Loans";
import Funds from "./pages/Funds"; 
import Penalties from "./pages/Penalties"; // ✅ নতুন পেনাল্টি ম্যানেজমেন্ট পেজ ইম্পোর্ট করা হলো

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
            Dashboard
        ========================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==========================
            Members
        ========================== */}

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
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

        {/* ✅ নতুন পেনাল্টি রিসিট রাউট যুক্ত করা হলো */}
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

        {/* ✅ নতুন পেনাল্টি ম্যানেজমেন্ট রাউট যুক্ত করা হলো */}
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

        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;