const express = require("express");

const router = express.Router();


const {

getMemberReport,

exportMemberExcel,

exportMemberPDF


}=require("../controllers/reportController");




// ======================================
// Member Report
// ======================================

router.get(
"/members",
getMemberReport
);



// ======================================
// Export Excel
// ======================================

router.get(
"/members/excel",
exportMemberExcel
);



// ======================================
// Export PDF
// ======================================

router.get(
"/members/pdf",
exportMemberPDF
);



module.exports = router;