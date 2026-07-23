const jwt = require("jsonwebtoken");

// ======================================
// Authentication Middleware (Updated)
// ======================================

const authMiddleware = (req, res, next) => {
  try {
    // ১. Authorization Header থেকে টোকেন সংগ্রহ করা
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization Token Missing or Invalid Format",
      });
    }

    // ২. টোকেন আলাদা করা
    const token = authHeader.split(" ")[1];

    // ৩. টোকেন ভেরিফাই করা (সিক্রেট কি মিসিং থাকলে ফলব্যাক দেওয়া হলো)
    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, secretKey);

    // ৪. টোকেন থেকে ইউজারের সঠিক আইডি এবং রোল ফেচ করা
    // এখানে আপনার লগইন টোকেনের স্ট্রাকচার অনুযায়ী সব সম্ভাব্য প্রপার্টি হ্যান্ডেল করা হয়েছে
    req.user = {
      id: decoded.id || decoded.userId || decoded._id,
      role: decoded.role ? decoded.role.toUpperCase() : 'MEMBER',
      ...decoded // বাকি প্রপার্টিগুলোও সাথে রেখে দেওয়া হলো
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token Payload: User ID missing",
      });
    }

    next(); // সফল হলে পরবর্তী কন্ট্রোলারে যাবে
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token Expired, Please Login Again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized Access: " + error.message,
    });
  }
};

module.exports = authMiddleware;