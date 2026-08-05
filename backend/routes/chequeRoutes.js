const express = require("express");
const router = express.Router();
const {
  getCheques,
  getChequeById,
  addCheque,
  updateCheque,
  deleteCheque,
  getChequeSummary,
} = require("../controllers/chequeController");

// যদি আপনার প্রজেক্টে অথেন্টিকেশন বা রোল চেক করার মিডলওয়্যার থাকে, 
// তবে নিচে সেগুলো import করে রাউটে ব্যবহার করতে হবে। যেমন:
// const { protect, authorize } = require("../middlewares/authMiddleware");

// -------------------------------------------------------------
// Public or General Routes (অথবা অথেন্টিকেটেড ইউজারের জন্য)
// -------------------------------------------------------------

// ১. সামারি পাওয়ার জন্য (এটি আইডি রাউটের উপরে রাখা হয়েছে যাতে 'summary' কে যেন MongoDB-তে ObjectId হিসেবে ভুল না ধরে)
router.get("/summary", getChequeSummary);

// ২. সব চেক পাওয়ার জন্য (Search, Filter, Pagination সহ)
router.get("/", getCheques);

// ৩. নির্দিষ্ট আইডি দিয়ে চেক খোঁজা
router.get("/:id", getChequeById);


// -------------------------------------------------------------
// Super Admin Protected Routes (চেক অ্যাড, আপডেট ও ডিলিট)
// -------------------------------------------------------------

// ৪. নতুন চেক যোগ করা (নোট: কন্ট্রোলারের ভেতরে অলরেডি `SUPER_ADMIN` চেক করা আছে, 
// তবে চাইলে এখানে `protect, authorize("SUPER_ADMIN")` মিডলওয়্যার দিতে পারেন)
router.post("/", addCheque);

// ৫. চেক আপডেট করা
router.put("/:id", updateCheque);

// ৬. চেক সফট ডিলিট করা
router.delete("/:id", deleteCheque);

module.exports = router;