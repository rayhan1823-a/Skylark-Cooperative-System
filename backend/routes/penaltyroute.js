const express = require('express');
const router = express.Router();
const {
    createPenalty,
    updatePenalty,
    getPenalties,
    getMemberPenalties,
    getPenaltyReceipt,
    deletePenalty
} = require('../controllers/penaltyController');

router.post('/', createPenalty);
router.put('/:id', updatePenalty);
router.get('/', getPenalties);
router.get('/member/:memberId', getMemberPenalties);
router.get('/:id', getPenaltyReceipt); // ✅ রিসিট দেখানোর জন্য এই রাউটটি যুক্ত করা হলো
router.delete('/:id', deletePenalty);

module.exports = router;