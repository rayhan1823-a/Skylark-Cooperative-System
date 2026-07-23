const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../utils/emailService");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ======================================
// Send OTP
// ======================================
const sendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!email && !phone) return res.status(400).json({ success: false, message: "Email or Phone required" });

        let user;
        if (email) user = await User.findOne({ email: email.toLowerCase() });
        if (!user && phone) user = await User.findOne({ phone });

        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        await OTP.deleteMany({ $or: [{ email: user.email }, { phone: user.phone }] });
        const otp = generateOTP();
        await OTP.create({
            email: user.email || "",
            phone: user.phone || "",
            otp,
            type: email ? "email" : "phone",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        if (email) await sendOTPEmail(user.email, otp, user.name);
        else console.log("OTP for Phone:", otp);

        return res.status(200).json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ======================================
// Verify OTP
// ======================================
const verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        const query = email ? { email: email.toLowerCase() } : { phone };
        const otpDoc = await OTP.findOne(query);

        if (!otpDoc || otpDoc.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        
        otpDoc.verified = true;
        await otpDoc.save();
        return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ======================================
// Reset Password
// ======================================
const resetPassword = async (req, res) => {
    try {
        const { email, phone, newPassword } = req.body;
        const query = email ? { email: email.toLowerCase() } : { phone };
        const otpDoc = await OTP.findOne(query);

        if (!otpDoc || !otpDoc.verified) return res.status(400).json({ success: false, message: "OTP not verified" });

        const user = await User.findOne(query);
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        await OTP.deleteOne({ _id: otpDoc._id });

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { sendOTP, verifyOTP, resetPassword };