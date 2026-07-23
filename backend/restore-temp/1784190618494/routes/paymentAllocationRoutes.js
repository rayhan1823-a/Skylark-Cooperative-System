const express = require("express");

const router = express.Router();


// Controller
const {
    getMemberAllocation
} = require("../controllers/paymentAllocationController");




// ======================================
// Get Member Payment Allocation History
// ======================================

router.get(
    "/member/:id",
    getMemberAllocation
);





module.exports = router;