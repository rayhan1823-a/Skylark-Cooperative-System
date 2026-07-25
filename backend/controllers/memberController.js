const Member = require('../models/Member');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Penalty = require('../models/Penalty');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { generateMemberAllocation, rebuildAllocation } = require('../services/paymentAllocator');

// ==========================================
// 1. Get All Members (Fast & Optimized)
// ==========================================
const getAllMembers = async (req, res) => {
    try {
        const userRole = req.user?.role ? String(req.user.role).toUpperCase() : '';
        let members = [];

        if (userRole === 'MEMBER') {
            const tokenMemberId = String(req.user.id || req.user._id || '');
            const rawPhone = String(req.user.phone || req.user.mobile || '').trim();
            const tokenPhone = rawPhone.replace(/[^0-9]/g, ''); // শুধুমাত্র ডিজিট রাখা

            const queryConditions = [];

            if (tokenMemberId && mongoose.Types.ObjectId.isValid(tokenMemberId)) {
                queryConditions.push({ _id: tokenMemberId });
            }
            if (tokenMemberId) {
                queryConditions.push({ memberId: tokenMemberId });
                queryConditions.push({ userId: tokenMemberId });
            }
            if (tokenPhone) {
                const phoneRegex = new RegExp(tokenPhone, 'i');
                queryConditions.push({ phone: phoneRegex });
                queryConditions.push({ mobile: phoneRegex });
            }

            if (queryConditions.length > 0) {
                const selfMember = await Member.findOne({ $or: queryConditions }).lean();
                members = selfMember ? [selfMember] : [];
            }
        } else {
            members = await Member.find().sort({ memberId: 1 }).lean();
        }

        return res.status(200).json({ 
            success: true, 
            count: members.length, 
            members 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// ==========================================
// 2. Get Single Member Profile with Summary
// ==========================================
const getMemberProfile = async (req, res) => {
    try {
        let { id } = req.params;
        if (id) id = String(id).trim();

        let member = null;
        const userRole = req.user?.role ? String(req.user.role).toUpperCase() : '';

        if (userRole === 'MEMBER') {
            const tokenMemberId = String(req.user.id || req.user._id || '');
            const tokenPhone = req.user.phone || req.user.mobile || '';

            const profileQueries = [];
            if (id) {
                if (mongoose.Types.ObjectId.isValid(id)) profileQueries.push({ _id: id });
                profileQueries.push({ memberId: id }, { userId: id });
            }
            if (tokenMemberId) {
                if (mongoose.Types.ObjectId.isValid(tokenMemberId)) profileQueries.push({ _id: tokenMemberId });
                profileQueries.push({ memberId: tokenMemberId }, { userId: tokenMemberId });
            }
            if (tokenPhone) {
                profileQueries.push({ phone: tokenPhone }, { mobile: tokenPhone });
            }

            if (profileQueries.length > 0) {
                member = await Member.findOne({ $or: profileQueries }).lean();
            }

            if (!member) {
                return res.status(404).json({ success: false, message: "Member profile not found." });
            }
        } else {
            if (!id) {
                return res.status(400).json({ success: false, message: "Member ID is required" });
            }

            const adminQueries = [];
            if (mongoose.Types.ObjectId.isValid(id)) adminQueries.push({ _id: id });
            adminQueries.push({ memberId: id }, { userId: id });

            member = await Member.findOne({ $or: adminQueries }).lean();
        }

        if (!member) {
            return res.status(404).json({ success: false, message: `Member not found with ID: ${id || 'Unknown'}` });
        }

        const memberMongoId = member._id;
        const customMemberId = member.memberId;

        // FIXED: Universal Deposit Fetching using flexible conditions & fallback
        let deposits = [];
        try {
            deposits = await Deposit.find({
                $or: [
                    { memberId: memberMongoId },
                    { member: memberMongoId },
                    { memberId: customMemberId },
                    { member: customMemberId },
                    { 'memberId._id': memberMongoId },
                    { 'member._id': memberMongoId },
                    { 'memberId.memberId': customMemberId },
                    { 'member.memberId': customMemberId }
                ]
            }).sort({ createdAt: -1, depositDate: -1 }).lean();

            // যদি উপরন্তু কোনো কারণে কুয়েরিতে না আসে, তবে সব ডিপোজিট এনে ডিপ ফিল্টার করা হবে
            if (!deposits || deposits.length === 0) {
                const allDeposits = await Deposit.find({}).lean();
                deposits = allDeposits.filter(d => {
                    const dMemberStr = JSON.stringify(d.member || d.memberId || '').toLowerCase();
                    return dMemberStr.includes(String(memberMongoId).toLowerCase()) || 
                           dMemberStr.includes(String(customMemberId).toLowerCase());
                });
            }
        } catch (err) {
            console.error("Deposit fetch error:", err);
            deposits = [];
        }

        // Parallel Fetching for Other Collections
        const [memberLoans, withdrawals, payments, memberPenalties] = await Promise.all([
            Loan.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ createdAt: -1 }).lean().catch(() => []),
            Withdrawal.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ date: -1 }).lean().catch(() => []),
            Payment.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ paymentDate: -1 }).lean().catch(() => []),
            Penalty.find({ $or: [{ member: memberMongoId }, { memberId: memberMongoId }, { member: customMemberId }, { memberId: customMemberId }] }).lean().catch(() => [])
        ]);

        const totalDeposit = deposits.reduce((sum, d) => sum + (Number(d.amount) || Number(d.paidAmount) || Number(d.depositAmount) || 0), 0);
        const totalLoan = memberLoans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);
        const totalPenalty = memberPenalties.reduce((sum, p) => sum + (Number(p.amount) || Number(p.fineAmount) || Number(p.total) || 0), 0);
        const totalWithdrawal = withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

        let allocationResult = { totalPaid: 0, totalDue: 0, monthlyDetails: [] };
        try {
            allocationResult = await generateMemberAllocation(memberMongoId);
        } catch (allocError) {
            console.error("Allocation Execution Error:", allocError.message);
        }

        const summary = {
            totalDeposit,
            totalWithdrawal,
            totalLoan,
            totalDue: allocationResult.totalDue || 0,
            totalPenalty,
            advanceBalance: 0
        };

        return res.status(200).json({ 
            success: true, 
            member, 
            summary, 
            totalLoan, 
            totalWithdrawal, 
            totalDeposit,
            totalPenalty, 
            deposits, 
            withdrawals, 
            payments, 
            loans: memberLoans, 
            penalties: memberPenalties, 
            allocations: allocationResult.monthlyDetails || [] 
        });
    } catch (error) {
        console.error("Get Member Profile Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 3. Create New Member (Super Admin Only)
// ==========================================
const createMember = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only SUPER_ADMIN can create members.",
            });
        }

        const { memberId, userId, password, mobile, phone, email } = req.body;
        
        if (!memberId) {
            return res.status(400).json({ success: false, message: "Member ID is required!" });
        }

        const existingMember = await Member.findOne({ memberId }).lean();
        if (existingMember) {
            return res.status(400).json({ success: false, message: "Member ID already exists!" });
        }

        const finalUserId = userId ? userId.trim() : memberId;
        const existingUser = await Member.findOne({ userId: finalUserId }).lean();
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User ID already exists!" });
        }

        const memberPhone = mobile || phone;
        const rawPassword = password ? String(password) : (memberPhone ? String(memberPhone) : "123456");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const memberData = {
            ...req.body,
            userId: finalUserId,
            password: hashedPassword,
            email: email || undefined
        };

        if (req.files) {
            if (req.files.photo?.[0]) memberData.photo = req.files.photo[0].path;
            if (req.files.nidFile?.[0]) memberData.nidFile = req.files.nidFile[0].path;
            if (req.files.signature?.[0]) memberData.signature = req.files.signature[0].path;
            if (req.files.nomineePhoto?.[0]) memberData.nomineePhoto = req.files.nomineePhoto[0].path;
            if (req.files.nomineeNid?.[0]) memberData.nomineeNid = req.files.nomineeNid[0].path;
        } else if (req.file) {
            memberData.photo = req.file.path;
        }

        const newMember = new Member(memberData);
        await newMember.save();

        return res.status(201).json({ 
            success: true, 
            message: "Member created successfully with login credentials!", 
            member: newMember 
        });
    } catch (error) {
        console.error("Create Member Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 4. Update Member (Super Admin Only)
// ==========================================
const updateMember = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only SUPER_ADMIN can update members.",
            });
        }

        let { id } = req.params;
        if (id) id = id.trim();

        const { _id, memberId, password, ...restData } = req.body;
        let updateData = { ...restData };

        if (password) {
            updateData.password = await bcrypt.hash(String(password), 10);
        }

        if (req.files) {
            if (req.files.photo?.[0]) updateData.photo = req.files.photo[0].path;
            if (req.files.nidFile?.[0]) updateData.nidFile = req.files.nidFile[0].path;
            if (req.files.signature?.[0]) updateData.signature = req.files.signature[0].path;
            if (req.files.nomineePhoto?.[0]) updateData.nomineePhoto = req.files.nomineePhoto[0].path;
            if (req.files.nomineeNid?.[0]) updateData.nomineeNid = req.files.nomineeNid[0].path;
        } else if (req.file) {
            updateData.photo = req.file.path;
        }

        let updatedMember;
        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedMember = await Member.findByIdAndUpdate(
                id, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );
        } else {
            updatedMember = await Member.findOneAndUpdate(
                { $or: [{ memberId: id }, { userId: id }] }, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );
        }

        if (!updatedMember) {
            return res.status(404).json({ success: false, message: "Member not found for update" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Member updated successfully", 
            member: updatedMember 
        });
    }catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 5. Delete Member (Super Admin Only)
// ==========================================
const deleteMember = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only SUPER_ADMIN can delete members.",
            });
        }

        let { id } = req.params;
        if (id) id = id.trim();
        let deletedMember;

        if (mongoose.Types.ObjectId.isValid(id)) {
            deletedMember = await Member.findByIdAndDelete(id);
        } else {
            deletedMember = await Member.findOneAndDelete({ $or: [{ memberId: id }, { userId: id }] });
        }

        if (!deletedMember) {
            return res.status(404).json({ success: false, message: "Member not found for deletion" });
        }

        return res.status(200).json({ success: true, message: "Member deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 6. Get Dashboard Stats
// ==========================================
const getDashboardStats = async (req, res) => {
    try {
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ status: { $regex: /^active$/i } });
        const inactiveMembers = totalMembers - activeMembers;

        return res.status(200).json({
            success: true,
            stats: {
                totalMembers,
                activeMembers,
                inactiveMembers
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    getAllMembers,
    getMemberProfile,
    createMember,
    updateMember,
    deleteMember,
    getDashboardStats
};