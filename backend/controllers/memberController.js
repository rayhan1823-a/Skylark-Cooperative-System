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
// 1. Get All Members (Role-based Restriction)
// ==========================================
const getAllMembers = async (req, res) => {
    try {
        const userRole = req.user?.role ? String(req.user.role).toUpperCase() : '';
        let members = [];

        if (userRole === 'MEMBER') {
            const tokenMemberId = String(req.user.id || req.user._id || '');
            const tokenPhone = String(req.user.phone || req.user.mobile || '').trim();

            let query = {};
            if (tokenMemberId && mongoose.Types.ObjectId.isValid(tokenMemberId)) {
                query = { _id: tokenMemberId };
            } else if (tokenMemberId) {
                query = { $or: [{ memberId: tokenMemberId }, { userId: tokenMemberId }] };
            } else if (tokenPhone) {
                query = { 
                    $or: [
                        { phone: tokenPhone }, 
                        { mobile: tokenPhone },
                        { phone: { $regex: new RegExp(tokenPhone, 'i') } },
                        { mobile: { $regex: new RegExp(tokenPhone, 'i') } }
                    ] 
                };
            }

            const selfMember = await Member.findOne(query);
            
            if (!selfMember && tokenPhone) {
                const allMembersList = await Member.find({});
                const matched = allMembersList.find(m => {
                    const mPhone = String(m.phone || m.mobile || '').trim();
                    return mPhone && (mPhone.includes(tokenPhone) || tokenPhone.includes(mPhone));
                });
                members = matched ? [matched] : [];
            } else {
                members = selfMember ? [selfMember] : [];
            }
        } else {
            members = await Member.find().sort({ memberId: 1 });
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

            if (id) {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    member = await Member.findById(id);
                }
                if (!member) {
                    member = await Member.findOne({ 
                        $or: [
                            { memberId: id }, 
                            { userId: id },
                            { memberId: new RegExp('^' + id + '$', 'i') },
                            { userId: new RegExp('^' + id + '$', 'i') }
                        ] 
                    });
                }
            }

            if (!member && tokenMemberId && mongoose.Types.ObjectId.isValid(tokenMemberId)) {
                member = await Member.findById(tokenMemberId);
            }
            if (!member && tokenMemberId) {
                member = await Member.findOne({ 
                    $or: [
                        { memberId: tokenMemberId }, 
                        { userId: tokenMemberId }
                    ] 
                });
            }
            if (!member && tokenPhone) {
                member = await Member.findOne({ 
                    $or: [{ phone: tokenPhone }, { mobile: tokenPhone }] 
                });
            }

            if (!member) {
                return res.status(404).json({ success: false, message: "Member profile not found." });
            }
        } else {
            if (!id) {
                return res.status(400).json({ success: false, message: "Member ID is required" });
            }

            if (mongoose.Types.ObjectId.isValid(id)) {
                member = await Member.findById(id);
            }

            if (!member) {
                member = await Member.findOne({ 
                    $or: [
                        { memberId: id }, 
                        { userId: id },
                        { memberId: new RegExp('^' + id + '$', 'i') },
                        { userId: new RegExp('^' + id + '$', 'i') }
                    ] 
                });
            }
        }

        if (!member) {
            return res.status(404).json({ success: false, message: `Member not found with ID: ${id || 'Unknown'}` });
        }

        const memberMongoId = member._id;
        const customMemberId = member.memberId;
        const memberName = member.name || '';

        // Fetch Deposits
        let deposits = await Deposit.find({
            $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
        }).sort({ createdAt: -1, depositDate: -1 }).catch(() => []);

        if ((!deposits || deposits.length === 0) && customMemberId) {
            deposits = await Deposit.find({
                $or: [
                    { memberId: customMemberId },
                    { member: customMemberId },
                    { 'memberId.memberId': customMemberId }
                ]
            }).sort({ createdAt: -1, depositDate: -1 }).catch(() => []);
        }

        const totalDeposit = deposits.reduce((sum, d) => sum + (Number(d.amount) || Number(d.paidAmount) || 0), 0);

        // Fetch Loans
        const memberLoans = await Loan.find({ 
            $or: [{ memberId: memberMongoId }, { member: memberMongoId }] 
        }).sort({ createdAt: -1, issueDate: -1 }).catch(() => []);
        
        const totalLoan = memberLoans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);

        // Fetch Penalties
        let memberPenalties = [];
        try {
            const queryConditions = [
                { member: memberMongoId }, { memberId: memberMongoId },
                { member: customMemberId }, { memberId: customMemberId },
                { member: String(memberMongoId) }, { memberId: String(memberMongoId) },
                { 'member._id': memberMongoId }, { 'memberId._id': memberMongoId },
                { 'member.memberId': customMemberId }, { 'memberId.memberId': customMemberId }
            ];

            memberPenalties = await Penalty.find({ $or: queryConditions }).lean().catch(() => []);

            if (!memberPenalties || memberPenalties.length === 0) {
                const db = mongoose.connection.db;
                const collections = await db.listCollections().toArray();
                
                let transactionPenalties = [];
                for (const col of collections) {
                    try {
                        const results = await db.collection(col.name).find({}).toArray();
                        const matched = results.filter(item => {
                            const itemStr = JSON.stringify(item).toLowerCase();
                            const matchMember = 
                                String(item.memberId || '') === String(memberMongoId) ||
                                String(item.member || '') === String(memberMongoId) ||
                                String(item.memberId || '') === String(customMemberId) ||
                                String(item.member || '') === String(customMemberId) ||
                                (memberName && itemStr.includes(memberName.toLowerCase())) ||
                                itemStr.includes(String(customMemberId).toLowerCase());
                            
                            const categoryStr = String(item.category || item.type || item.description || item.note || item.title || item.reason || '').toLowerCase();
                            const matchCategory = categoryStr.includes('penalty') || categoryStr.includes('fine') || col.name.toLowerCase().includes('penalty') || col.name.toLowerCase().includes('fine');
                            
                            return matchMember && matchCategory;
                        });
                        transactionPenalties = [...transactionPenalties, ...matched];
                    } catch (colErr) {
                        // Ignore individual collection errors
                    }
                }

                const combinedMap = new Map();
                transactionPenalties.forEach(item => {
                    const key = item._id ? item._id.toString() : JSON.stringify(item);
                    combinedMap.set(key, item);
                });
                memberPenalties = Array.from(combinedMap.values());
            }
        } catch (err) {
            console.error("Penalty fetch major error:", err);
            memberPenalties = [];
        }

        const totalPenalty = memberPenalties.reduce((sum, p) => sum + (Number(p.amount) || Number(p.fineAmount) || Number(p.total) || Number(p.penaltyAmount) || 0), 0);

        // Fetch Withdrawals & Payments
        const withdrawals = await Withdrawal.find({ 
            $or: [{ memberId: memberMongoId }, { member: memberMongoId }] 
        }).sort({ date: -1, createdAt: -1 }).catch(() => []);
        
        const totalWithdrawal = withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

        const payments = await Payment.find({ 
            $or: [{ memberId: memberMongoId }, { member: memberMongoId }] 
        }).sort({ paymentDate: -1 }).catch(() => []);
        
        // Allocation Calculation
        let allocationResult = { totalPaid: 0, totalDue: 0, monthlyDetails: [] };
        try {
            await rebuildAllocation(memberMongoId);
            allocationResult = await generateMemberAllocation(memberMongoId);
            
            if ((!allocationResult.monthlyDetails || allocationResult.monthlyDetails.length === 0) && customMemberId) {
                await rebuildAllocation(customMemberId);
                allocationResult = await generateMemberAllocation(customMemberId);
            }
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

        const existingMember = await Member.findOne({ memberId });
        if (existingMember) {
            return res.status(400).json({ success: false, message: "Member ID already exists!" });
        }

        const finalUserId = userId ? userId.trim() : memberId;
        const existingUser = await Member.findOne({ userId: finalUserId });
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

        const { _id, password, ...restData } = req.body;
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
    } catch (error) {
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

// ==========================================
// 7. Reorder Member IDs (Safe & Duplicate Free)
// ==========================================
const reorderMemberIds = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only SUPER_ADMIN can reorder member IDs.",
            });
        }

        // সব মেম্বারকে তাদের তৈরির ক্রমানুসারে ফেচ করা হলো
        const members = await Member.find().sort({ createdAt: 1, _id: 1 });

        if (!members || members.length === 0) {
            return res.status(404).json({ success: false, message: "No members found" });
        }

        // ধাপ ১: ডুপ্লিকেট এরর এড়াতে সবার আইডিতে সাময়িকভাবে TEMP- যুক্ত করা হলো
        for (let i = 0; i < members.length; i++) {
            members[i].memberId = `TEMP-${members[i]._id}`;
            await members[i].save();
        }

        // প্রতি বছর বা প্রিফিক্সের জন্য আলাদা সিরিয়াল কাউন্টার
        const yearCounters = {};

        // ধাপ ২: এবার সঠিক প্রিফিক্স ও সিকোয়েন্স অনুযায়ী আইডি সেট করা হচ্ছে
        for (const member of members) {
            // অরিজিনাল আইডি বা জয়েনিং ইয়ার বের করা
            const originalId = String(member.memberId || '').trim();
            
            // সাল বের করার চেষ্টা (যেমন createdAt থেকে অথবা আইডি থেকে)
            let prefix = 'SKY-2023';
            const joinedYear = member.createdAt ? new Date(member.createdAt).getFullYear() : 2023;
            
            if (originalId.includes('SKY-2023') || joinedYear === 2023) {
                prefix = 'SKY-2023';
            } else if (originalId.includes('SKY-2024') || joinedYear === 2024) {
                prefix = 'SKY-2024';
            } else if (originalId.includes('SKY-2025') || joinedYear === 2025) {
                prefix = 'SKY-2025';
            } else if (originalId.includes('SKY-2026') || joinedYear === 2026) {
                prefix = 'SKY-2026';
            } else {
                prefix = `SKY-${joinedYear}`;
            }

            if (!yearCounters[prefix]) {
                yearCounters[prefix] = 1;
            } else {
                yearCounters[prefix]++;
            }

            const paddedSerial = String(yearCounters[prefix]).padStart(3, '0');
            const newMemberId = `${prefix}${paddedSerial}`;

            await Member.findByIdAndUpdate(member._id, { memberId: newMemberId });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully reordered all member IDs safely without duplicate errors!",
        });
    } catch (error) {
        console.error("Reorder IDs Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = {
    getAllMembers,
    getMemberProfile,
    createMember,
    updateMember,
    deleteMember,
    getDashboardStats,
    reorderMemberIds
};