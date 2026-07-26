const express = require('express');
const router = express.Router();
const HomeContent = require('../models/HomeContent');

// ১. হোম পেজের কন্টেন্ট দেখার জন্য (GET)
router.get('/', async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) {
      // যদি ডাটাবেজে আগে থেকে কিছু না থাকে, তবে ডিফল্ট কন্টেন্ট তৈরি করে নেবে
      content = await HomeContent.create({
        title: "সমিতি হোম পেজ (Somiti Home)",
        subtitle: "স্বাগতম! সমিতির মূল তথ্যাবলী ও আপডেট এখানে দেখতে পাবেন।"
      });
    }
    res.json(content);
  } catch (err) {
    console.error("Error fetching home content:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ২. হোম পেজের কন্টেন্ট আপডেট বা এডিট করার জন্য (PUT)
router.put('/', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    
    let content = await HomeContent.findOne();
    if (!content) {
      content = new HomeContent({ title, subtitle });
    } else {
      content.title = title;
      content.subtitle = subtitle;
    }
    
    await content.save();
    res.json({ message: "Content updated successfully", content });
  } catch (err) {
    console.error("Error updating home content:", err);
    res.status(500).json({ error: "Failed to update content" });
  }
});

module.exports = router;