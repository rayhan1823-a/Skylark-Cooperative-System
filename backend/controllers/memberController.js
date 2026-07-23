const Member = require('../models/Member');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Penalty = require('../models/Penalty'); // ✅ পেনাল্টি মডেল যুক্ত করা হলো
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ✅ পাসওয়ার্ড হাশ করার জন্য bcryptjs যুক্ত করা হলো

const { generateMemberAllocation, rebuildAllocation } = require('../services/paymentAllocator');

// ======================================
// 1. Get All Members
// ======================================
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: members.length, members });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ======================================
// 2. Get Single Member Profile with Full Summary & History
// ======================================
const getMemberProfile = async (req, res) => {
    try {
        let { id } = req.params;

        // ✅ নিরাপত্তা চেক এবং অটো-রিডাইরেক্ট: 
        // যদি ইউজার সাধারণ মেম্বার হয় এবং সে যদি নিজের আইডি বা ড্যাশবোর্ড থেকে রিকোয়েস্ট করে,
        // অথবা রাউটে আইডি হিসেবে 'me' বা নিজের আইডি না পাঠিয়ে থাকে, তবে তাকে তার নিজস্ব আইডিতে রূপান্তর করে নেওয়া হবে।
        if (req.user && req.user.role === 'MEMBER') {
            if (!id || id === 'me' || id === 'profile') {
                id = req.user.id || req.user._id;
            }
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Member ID is required" });
        }
        id = String(id).trim();

        let member = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            member = await Member.findById(id);
        }

        if (!member) {
            member = await Member.findOne({ memberId: id });
        }

        if (!member) {
            member = await Member.findOne({ memberId: new RegExp('^' + id + '$', 'i') });
        }

        // ইউজার আইডি দিয়েও প্রোফাইল খোঁজার সুবিধা যুক্ত করা হলো
        if (!member) {
            member = await Member.findOne({ userId: id });
        }

        // যদি টোকেনের আইডি দিয়ে সরাসরি পাওয়া না যায়, তবে টোকেনের ভেতর থাকা আইডি বা ফোন দিয়ে ফাইনাল খোঁজা
        if (!member && req.user && req.user.role === 'MEMBER') {
            if (mongoose.Types.ObjectId.isValid(req.user.id)) {
                member = await Member.findById(req.user.id);
            }
            if (!member && req.user.phone) {
                member = await Member.findOne({ phone: req.user.phone });
            }
        }

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found with ID: " + id });
        }

        // নিরাপত্তা চেক: সাধারণ মেম্বার হলে সে কেবল নিজের প্রোফাইলই দেখতে পারবে, অন্যের নয়
        if (req.user && req.user.role === 'MEMBER') {
            const isSelf = 
                String(member._id) === String(req.user.id || req.user._id) || 
                String(member.userId) === String(req.user.id || req.user._id) || 
                (req.user.phone && member.phone === req.user.phone);

            if (!isSelf) {
                return res.status(403).json({ success: false, message: "Unauthorized! You can only view your own profile." });
            }
        }

        const memberMongoId = member._id;
        const customMemberId = member.memberId;
        const memberName = member.name || '';

        let queryMongoId = memberMongoId; 

        let deposits = await Deposit.find({
            $or: [
                { memberId: queryMongoId },
                { member: queryMongoId }
            ]
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

        const memberLoans = await Loan.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ createdAt: -1, issueDate: -1 }).catch(() => []);
        const totalLoan = memberLoans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);

        // ==========================================================
        // ✅ ফিক্সড এবং ডাইনামিক পেনাল্টি কুয়েরি লজিক
        // ==========================================================
        let memberPenalties = [];
        try {
            const queryConditions = [
                { member: memberMongoId },
                { memberId: memberMongoId },
                { member: customMemberId },
                { memberId: customMemberId },
                { member: String(memberMongoId) },
                { memberId: String(memberMongoId) },
                { 'member._id': memberMongoId },
                { 'memberId._id': memberMongoId },
                { 'member.memberId': customMemberId },
                { 'memberId.memberId': customMemberId }
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
                        // ইগ্নোর
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

        const withdrawals = await Withdrawal.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ date: -1, createdAt: -1 }).catch(() => []);
        const totalWithdrawal = withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

        const payments = await Payment.find({ $or: [{ memberId: memberMongoId }, { member: memberMongoId }] }).sort({ paymentDate: -1 }).catch(() => []);
        
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
            totalDeposit: totalDeposit,
            totalWithdrawal: totalWithdrawal,
            totalLoan: totalLoan,
            totalDue: allocationResult.totalDue || 0,
            totalPenalty: totalPenalty, 
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

// ======================================
// 3. Create New Member (Updated with Custom User ID, Password & Email)
// ======================================
const createMember = async (req, res) => {
    try {
        const { memberId, userId, password, mobile, phone, email } = req.body;
        
        if (!memberId) {
            return res.status(400).json({ success: false, message: "Member ID is required!" });
        }

        const existingMember = await Member.findOne({ memberId });
        if (existingMember) {
            return res.status(400).json({ success: false, message: "Member ID already exists!" });
        }

        // যদি ইউজার আইডি দেওয়া হয়, তবে তা ডুপ্লিকেট কি না চেক করা
        const finalUserId = userId ? userId.trim() : memberId;
        const existingUser = await Member.findOne({ userId: finalUserId });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User ID already exists!" });
        }

        // পাসওয়ার্ড হ্যান্ডলিং: অ্যাডমিন পাসওয়ার্ড দিলে সেটাই হাশ হবে, না দিলে মোবাইল নম্বর বা ডিফল্ট পাসওয়ার্ড
        const memberPhone = mobile || phone;
        const rawPassword = password ? String(password) : (memberPhone ? String(memberPhone) : "123456");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const memberData = {
            ...req.body,
            userId: finalUserId,
            password: hashedPassword,
            email: email || undefined
        };

        // ✅ ফোল্ডারের নামসহ সঠিক পাথ সেভ করার লজিক
        if (req.files) {
            if (req.files.photo && req.files.photo[0]) {
                memberData.photo = `photos/${req.files.photo[0].filename}`;
            }
            if (req.files.nidFile && req.files.nidFile[0]) {
                memberData.nidFile = `nid/${req.files.nidFile[0].filename}`;
            }
            if (req.files.signature && req.files.signature[0]) {
                memberData.signature = `signatures/${req.files.signature[0].filename}`;
            }
            if (req.files.nomineePhoto && req.files.nomineePhoto[0]) {
                memberData.nomineePhoto = `nominee/${req.files.nomineePhoto[0].filename}`;
            }
            if (req.files.nomineeNid && req.files.nomineeNid[0]) {
                memberData.nomineeNid = `nominee-nid/${req.files.nomineeNid[0].filename}`;
            }
        } else if (req.file) {
            memberData.photo = `photos/${req.file.filename}`;
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

// ======================================
// 4. Update Member
// ======================================
const updateMember = async (req, res) => {
    try {
        let { id } = req.params;
        if (id) id = id.trim();

        const { _id, memberId, password, ...restData } = req.body;
        let updateData = { ...restData };

        // যদি আপডেট করার সময় নতুন পাসওয়ার্ড দেওয়া হয়, তবে তা হাশ করে আপডেট করা
        if (password) {
            updateData.password = await bcrypt.hash(String(password), 10);
        }

        // ✅ আপডেট করার সময় ফোল্ডারের নামসহ সঠিক পাথ সেভ করার লজিক
        if (req.files) {
            if (req.files.photo && req.files.photo[0]) {
                updateData.photo = `photos/${req.files.photo[0].filename}`;
            }
            if (req.files.nidFile && req.files.nidFile[0]) {
                updateData.nidFile = `nid/${req.files.nidFile[0].filename}`;
            }
            if (req.files.signature && req.files.signature[0]) {
                updateData.signature = `signatures/${req.files.signature[0].filename}`;
            }
            if (req.files.nomineePhoto && req.files.nomineePhoto[0]) {
                updateData.nomineePhoto = `nominee/${req.files.nomineePhoto[0].filename}`;
            }
            if (req.files.nomineeNid && req.files.nomineeNid[0]) {
                updateData.nomineeNid = `nominee-nid/${req.files.nomineeNid[0].filename}`;
            }
        } else if (req.file) {
            updateData.photo = `photos/${req.file.filename}`;
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

// ======================================
// 5. Delete Member
// ======================================
const deleteMember = async (req, res) => {
    try {
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

// ======================================
// 6. Get Dashboard Stats
// ======================================
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