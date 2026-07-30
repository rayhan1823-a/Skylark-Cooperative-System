const Investment = require('../models/Investment');

// নতুন ইনভেস্টমেন্ট বা FDR সেভ করার লজিক
exports.createInvestment = async (req, res, next) => {
  try {
    const newInvestment = new Investment(req.body);
    const saved = await newInvestment.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

// সকল ইনভেস্টমেন্ট বা FDR এর তালিকা দেখার লজিক
exports.getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: investments });
  } catch (err) {
    next(err);
  }
};