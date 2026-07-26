const mongoose = require('mongoose');

const homeContentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    default: "সমিতি হোম পেজ (Somiti Home)" 
  },
  subtitle: { 
    type: String, 
    required: true, 
    default: "স্বাগতম! সমিতির মূল তথ্যাবলী ও আপডেট এখানে দেখতে পাবেন।" 
  }
}, { timestamps: true });

module.exports = mongoose.model('HomeContent', homeContentSchema);