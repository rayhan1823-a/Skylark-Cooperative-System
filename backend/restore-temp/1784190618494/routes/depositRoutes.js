const express = require("express");

const router = express.Router();



// Controllers

const {

createDeposit,

getDeposits,

getMemberDeposits,

getDeposit,

updateDeposit,

deleteDeposit


} = require("../controllers/depositController");




// Middleware

const authMiddleware =
require("../middlewares/authMiddleware");


const roleMiddleware =
require("../middlewares/roleMiddleware");






// ======================================
// Add Deposit
// SUPER_ADMIN + STAFF
// ======================================


router.post(

"/",

authMiddleware,

roleMiddleware(
"SUPER_ADMIN",
"STAFF"
),

createDeposit

);







// ======================================
// Get All Deposits
// Login User
// ======================================


router.get(

"/",

authMiddleware,

getDeposits

);







// ======================================
// Member Deposit History
// Login User
// ======================================


router.get(

"/member/:id",

authMiddleware,

getMemberDeposits

);







// ======================================
// Single Deposit
// Login User
// ======================================


router.get(

"/:id",

authMiddleware,

getDeposit

);







// ======================================
// Update Deposit
// SUPER_ADMIN + STAFF
// ======================================


router.put(

"/:id",

authMiddleware,

roleMiddleware(
"SUPER_ADMIN",
"STAFF"
),

updateDeposit

);







// ======================================
// Delete Deposit
// SUPER_ADMIN + STAFF
// ======================================


router.delete(

"/:id",

authMiddleware,

roleMiddleware(
"SUPER_ADMIN",
"STAFF"
),

deleteDeposit

);







module.exports = router;