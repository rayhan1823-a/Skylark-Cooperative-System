const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ======================================
// Get Profile
// ======================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Update Profile
// ======================================

const updateProfile = async (req, res) => {
  try {

    const { name, phone, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name;
    user.phone = phone;
    user.email = email;

    await user.save();

    res.json({
      success: true,
      message: "Profile Updated Successfully",
      user,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ======================================
// Change Password
// ======================================

const changePassword = async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

    const match = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!match) {

      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });

    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      success: true,
      message: "Password Changed Successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};