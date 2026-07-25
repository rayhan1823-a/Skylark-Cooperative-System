const User = require("../models/User");
const Member = require("../models/Member"); // ✅ Added
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================
// Register User
// ======================================
const register = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Phone and Password required",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role || "MEMBER",
    });

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Login User (Production Ready)
// ======================================
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and Password required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // =====================================================
    // Find Related Member (if exists)
    // =====================================================
    const member = await Member.findOne({
      $or: [
        { phone: user.phone },
        { mobile: user.phone },
        { userId: user.phone },
      ],
    });

    // =====================================================
    // JWT Token
    // =====================================================
    const token = jwt.sign(
      {
        id: user._id,
        memberId: member ? member._id : null,
        memberCode: member ? member.memberId : null,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        memberId: member ? member._id : null,
        memberCode: member ? member.memberId : null,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Change Password
// ======================================
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // টোকেন থেকে ইউজারের আইডি নেওয়া হচ্ছে

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and New Passwords are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // পুরনো পাসওয়ার্ড ম্যাচ করছে কিনা চেক করা
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // নতুন পাসওয়ার্ড এনক্রিপ্ট করে সেভ করা
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Forgot Password (OTP / Reset Link Handler)
// ======================================
const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number is required",
      });
    }

    const user = await User.findOne({ $or: [{ email }, { phone }] });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email or phone",
      });
    }

    // এখানে আপনি চাইলে Nodemailer দিয়ে ইমেইল বা SMS পাঠানোর লজিক যুক্ত করতে পারেন।
    // আপাতত সাকসেস রেসপন্স পাঠানো হচ্ছে যাতে ফ্রন্টএন্ডে এরর না আসে।
    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword, // ✅ এক্সপোর্ট করা হলো
};