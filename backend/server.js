// ======================================
// Imports
// ======================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ======================================
// Config
// ======================================

dotenv.config();

// ======================================
// App Initialize
// ======================================

const app = express();

// ✅ Trust Proxy (Render/Vercel-এর জন্য)
app.set("trust proxy", 1);

// ======================================
// Automatic Backup Scheduler
// ======================================

const startBackupScheduler = require("./services/backupScheduler");

// ======================================
// Middlewares
// ======================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://skylark-cooperative-system.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ ফাইলের সাইজ লিমিট ৫০ এমবি থেকে বাড়িয়ে ৫০০ এমবি করা হলো
app.use(
  express.json({
    limit: "500mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "500mb",
  })
);

// ======================================
// Static Folder
// ======================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================================
// Import Routes
// ======================================

// Authentication
const authRoutes = require("./routes/authRoutes");

// Forgot Password
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");

// Users
const userRoutes = require("./routes/userRoutes");

// Members
const memberRoutes = require("./routes/memberRoutes");

// Dashboard
const dashboardRoutes = require("./routes/dashboardRoutes");

// Deposits
const depositRoutes = require("./routes/depositRoutes");

// ✅ Deposit Receipt
const depositReceiptRoutes = require("./routes/depositReceiptRoutes");

// Payments
const paymentRoutes = require("./routes/paymentRoutes");

// Loans
const loanRoutes = require("./routes/loanRoutes");

// Transactions
const transactionRoutes = require("./routes/transactionRoutes");

// ======================================
// More Routes
// ======================================

// Member Exit
const memberExitRoutes = require("./routes/memberExitRoutes");

// Funds
const fundRoutes = require("./routes/fundRoutes");

// Reports
const reportRoutes = require("./routes/reportRoutes");

// Payment Allocation
const paymentAllocationRoutes = require("./routes/paymentAllocationRoutes");

// Settings
const settingsRoutes = require("./routes/settingsRoutes");

// Backup
const backupRoutes = require("./routes/backupRoutes");

// ✅ Withdrawals Route
const withdrawalRoutes = require("./routes/withdrawalRoutes");

// ✅ Penalty Route
const penaltyRoute = require("./routes/penaltyroute");

// ✅ Investment & FDR Route (New)
const investmentRoutes = require("./routes/investmentRoutes");

// ✅ Videos Route
const videoRoutes = require("./routes/videoRoutes");

// ✅ Photos Route
const photoRoutes = require("./routes/photoRoutes");

// ✅ Cheques Route (New)
const chequeRoutes = require("./routes/chequeRoutes");

// ======================================
// API Routes
// ======================================

// Authentication
app.use("/api/auth", authRoutes);

// Forgot Password
app.use("/api/forgot-password", forgotPasswordRoutes);

// Users
app.use("/api/users", userRoutes);

// Members
app.use("/api/members", memberRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Deposits
app.use("/api/deposits", depositRoutes);

// ✅ Deposit Receipt Route
app.use("/api/deposit-receipt", depositReceiptRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// Loans
app.use("/api/loans", loanRoutes);

// Transactions
app.use("/api/transactions", transactionRoutes);

// Member Exit
app.use("/api/member-exit", memberExitRoutes);

// Funds
app.use("/api/funds", fundRoutes);

// ======================================
// Remaining API Routes
// ======================================

// Reports
app.use("/api/reports", reportRoutes);

// Payment Allocation
app.use("/api/payment-allocation", paymentAllocationRoutes);

// Settings
app.use("/api/settings", settingsRoutes);

// Backup
app.use("/api/backup", backupRoutes);

// ✅ Withdrawals API Route
app.use("/api/withdrawals", withdrawalRoutes);

// ✅ Penalty API Route
app.use("/api/penalties", penaltyRoute);

// ✅ Investment & FDR API Route (New)
app.use("/api/investments", investmentRoutes);

// ✅ Video Gallery API Route
app.use("/api/videos", videoRoutes);

// ✅ Photo Gallery API Route
app.use("/api/photos", photoRoutes);

// ✅ Cheques API Route (New)
app.use("/api/cheques", chequeRoutes);

// ======================================
// Root Route
// ======================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    app: "Skylark Cooperative Management System",
    version: "1.0.0",
    message: "🚀 API Running Successfully",
  });
});

// ✅ Health Check Route (with ISO String)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ======================================
// 404 Handler
// ======================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ======================================
// Global Error Handler
// ======================================

app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ======================================
// MongoDB Connection & Server Start
// ======================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("======================================");
      console.log(`🚀 Server Running : http://localhost:${PORT}`);
      console.log("======================================");

      // Automatic Daily Backup Scheduler
      startBackupScheduler();

      console.log("✅ Backup Scheduler Started");
      console.log("✅ Deposit Receipt Route Loaded");
      console.log("✅ Penalty Route Loaded");
      console.log("✅ Investment & FDR Route Loaded");
      console.log("✅ Video Gallery Route Loaded");
      console.log("✅ Photo Gallery Route Loaded");
      console.log("✅ Cheques Route Loaded");
      console.log("✅ Skylark Cooperative Management System Ready");
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });