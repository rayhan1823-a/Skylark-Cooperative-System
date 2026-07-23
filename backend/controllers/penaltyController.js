const Penalty = require('../models/Penalty');
const Member = require('../models/Member');

// Create Penalty
const createPenalty = async (req, res) => {
    try {
        const { memberId, member, amount, date, reason, note, status } = req.body;
        const selectedMember = memberId || member;
        const penaltyReason = reason || note;

        if (!selectedMember || !amount) {
            return res.status(400).json({ success: false, message: "Member and Amount are required." });
        }

        const memberInfo = await Member.findById(selectedMember);
        if (!memberInfo) {
            return res.status(404).json({ success: false, message: "Member not found." });
        }

        // Generate Receipt No (e.g., SKY-PEN-00001)
        const lastPenalty = await Penalty.findOne().sort({ createdAt: -1 });
        let seq = 1;
        if (lastPenalty && lastPenalty.receiptNo) {
            const parts = lastPenalty.receiptNo.split("-");
            const lastNum = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastNum)) seq = lastNum + 1;
        }
        const receiptNo = `SKY-PEN-${String(seq).padStart(5, "0")}`;

        const penalty = await Penalty.create({
            member: selectedMember,
            amount,
            date: date || Date.now(),
            receiptNo,
            reason: penaltyReason,
            note: penaltyReason,
            status: status || "Paid" // ডিফল্ট স্ট্যাটাস Paid করা হলো
        });

        res.status(201).json({
            success: true,
            message: "Penalty Added Successfully",
            penalty
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Update Penalty
const updatePenalty = async (req, res) => {
    try {
        const { memberId, member, amount, date, reason, note, status } = req.body;
        const selectedMember = memberId || member;
        const penaltyReason = reason || note;

        const penalty = await Penalty.findById(req.params.id);
        if (!penalty) {
            return res.status(404).json({ success: false, message: "Penalty not found" });
        }

        penalty.member = selectedMember || penalty.member;
        penalty.amount = amount || penalty.amount;
        penalty.date = date || penalty.date;
        penalty.reason = penaltyReason || penalty.reason;
        penalty.note = penaltyReason || penalty.note;
        penalty.status = status || penalty.status;

        await penalty.save();

        res.json({
            success: true,
            message: "Penalty Updated Successfully",
            penalty
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get All Penalties
const getPenalties = async (req, res) => {
    try {
        const penalties = await Penalty.find()
            .populate("member", "memberId name fullName phone")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: penalties.length, penalties });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get Member Penalties
const getMemberPenalties = async (req, res) => {
    try {
        const penalties = await Penalty.find({ member: req.params.memberId })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: penalties.length, penalties });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get Single Penalty Receipt (রিসিট প্রিন্ট করার জন্য নতুন যোগ করা হলো)
const getPenaltyReceipt = async (req, res) => {
    try {
        const penalty = await Penalty.findById(req.params.id)
            .populate("member", "memberId name fullName phone address");
            
        if (!penalty) {
            return res.status(404).json({ success: false, message: "Penalty Receipt not found" });
        }

        res.json({ success: true, penalty });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete Penalty
const deletePenalty = async (req, res) => {
    try {
        const penalty = await Penalty.findById(req.params.id);
        if (!penalty) {
            return res.status(404).json({ success: false, message: "Penalty not found" });
        }

        await Penalty.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Penalty Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    createPenalty,
    updatePenalty,
    getPenalties,
    getMemberPenalties,
    getPenaltyReceipt,
    deletePenalty
};