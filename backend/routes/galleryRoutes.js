const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const multer = require('multer');

// ফাইল স্টোরেজ কনফিগারেশন (লোকাল ফোল্ডারে সেভ করার জন্য)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ব্যাকএন্ডের uploads ফোল্ডারে সেভ হবে
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ১. সব গ্যালারি ছবি দেখার জন্য (GET)
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error("Error fetching gallery images:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ২. নতুন ছবি আপলোড করার জন্য (POST) - ডাইনামিক বেস ইউআরএল সহ
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // লোকাল বা লাইভ সার্ভারের বেস ইউআরএল ডায়নামিকভাবে তৈরি করা (যাতে রেন্ডার বা লোকালহোস্ট উভয় জায়গাতেই কাজ করে)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const newImage = new Gallery({ 
      title, 
      imageUrl 
    });

    await newImage.save();
    res.status(201).json({ message: "Image uploaded successfully!", newImage });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ৩. ছবি ডিলিট করার জন্য (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

module.exports = router;