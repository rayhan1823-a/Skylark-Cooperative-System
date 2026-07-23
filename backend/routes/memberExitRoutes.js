const express = require("express");

const router = express.Router();


// Controller Import

const {
    memberExit,
    getMemberExits,
    getMemberExit
} = require("../controllers/memberExitController");




// ======================================
// Create Member Exit
// POST
// ======================================

router.post(
    "/",
    memberExit
);




// ======================================
// Get All Exit Records
// GET
// ======================================

router.get(
    "/",
    getMemberExits
);




// ======================================
// Get Single Exit Record
// GET
// ======================================

router.get(
    "/:id",
    getMemberExit
);




// ======================================
// Export
// ======================================

module.exports = router;