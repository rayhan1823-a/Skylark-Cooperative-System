// ======================================
// Role Middleware
// ======================================

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check Login
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Check Role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access Denied! Permission Required",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);

      return res.status(500).json({
        success: false,
        message: "Role Check Error",
      });
    }
  };
};

module.exports = roleMiddleware;