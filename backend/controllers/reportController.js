const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const Loan = require("../models/Loan");
const Penalty = require("../models/Penalty");
const { calculateMemberSummary } = require("../services/dueCalculator");

const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


// ======================================
// Helper Function: সমিতির নিয়ম অনুযায়ী সবার জন্য জুলাই ২০২৩ থেকে বর্তমান পর্যন্ত ফিক্সড ডিপোজিট হিসাব
// ======================================
const calculateTotalFixedDeposit = () => {
    const startDate = new Date(2023, 6, 1); // জুলাই ২০২৩ (মাস ৬ মানে জুলাই)
    const currentDate = new Date();
    
    let totalFixedDeposit = 0;
    let iterDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const stopDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    while (iterDate <= stopDate) {
        const year = iterDate.getFullYear();
        const month = iterDate.getMonth(); // 0 = January, 6 = July ইত্যাদি

        let monthlyRate = 2000; // ডিফল্ট বা ২০২৬ সালের জুলাই বা তার পরের হার
        
        if (year === 2023) {
            if (month >= 6) { // জুলাই ২০২৩ থেকে ডিসেম্বর ২০২৩
                monthlyRate = 500;
            } else {
                monthlyRate = 0;
            }
        } else if (year === 2024) {
            if (month <= 5) { // জানুয়ারি ২০২৪ থেকে জুন ২০২৪
                monthlyRate = 500;
            } else { // জুলাই ২০২৪ থেকে ডিসেম্বর ২০২৪
                monthlyRate = 1000;
            }
        } else if (year === 2025) {
            if (month <= 5) { // জানুয়ারি ২০২৫ থেকে জুন ২০২৫
                monthlyRate = 1000;
            } else { // জুলাই ২০২৫ থেকে ডিসেম্বর ২০২৫
                monthlyRate = 1500;
            }
        } else if (year === 2026) {
            if (month <= 5) { // জানুয়ারি ২০২৬ থেকে জুন ২০২৬
                monthlyRate = 1500;
            } else { // জুলাই ২০২৬ থেকে বর্তমান
                monthlyRate = 2000;
            }
        } else if (year > 2026) {
            monthlyRate = 2000;
        }

        totalFixedDeposit += monthlyRate;
        iterDate.setMonth(iterDate.getMonth() + 1);
    }

    return totalFixedDeposit;
};


// ======================================
// Member Report Data
// ======================================

const getMemberReport = async (req, res) => {
    try {
        const members = await Member.find()
        .sort({
            createdAt: -1
        });

        const report = [];
        const totalFixedDeposit = calculateTotalFixedDeposit();

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const memberMongoId = member._id;

            // Summary from Due Calculator service
            const summary = await calculateMemberSummary(
                memberMongoId
            ).catch(() => ({}));

            // Total Deposit
            const deposit = await Deposit.aggregate([
                {
                    $match: {
                        $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

            // Total Withdrawal
            const withdrawal = await Withdrawal.aggregate([
                {
                    $match: {
                        $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

            // Total Loan
            const loan = await Loan.aggregate([
                {
                    $match: {
                        $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

            // Total Penalty
            const penalty = await Penalty.aggregate([
                {
                    $match: {
                        $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

            report.push({
                sl: i + 1,
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                joiningDate: member.joiningDate,
                status: member.status,
                fixedDeposit: totalFixedDeposit,
                totalDeposit: deposit.length ? deposit[0].total : 0,
                totalWithdrawal: withdrawal.length ? withdrawal[0].total : 0,
                totalLoan: loan.length ? loan[0].total : 0,
                totalPenalty: penalty.length ? penalty[0].total : (summary.totalPenalty || 0),
                advance: summary.advance || 0,
                totalDue: summary.totalDue || 0
            });
        }

        return res.status(200).json({
            success: true,
            count: report.length,
            report
        });

    } catch (error) {
        console.log(
            "Member Report Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ======================================
// Export Excel
// ======================================

const exportMemberExcel = async (req, res) => {
    try {
        const members = await getReportData();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(
            "Member Report"
        );

        sheet.columns = [
            { header: "SL", key: "sl", width: 10 },
            { header: "Member ID", key: "memberId", width: 15 },
            { header: "Member Name", key: "name", width: 25 },
            { header: "Phone", key: "phone", width: 15 },
            { header: "Fixed Deposit", key: "fixedDeposit", width: 15 },
            { header: "Total Deposit", key: "totalDeposit", width: 15 },
            { header: "Total Withdrawal", key: "totalWithdrawal", width: 15 },
            { header: "Total Loan", key: "totalLoan", width: 15 },
            { header: "Total Penalty", key: "totalPenalty", width: 15 },
            { header: "Advance", key: "advance", width: 15 },
            { header: "Total Due", key: "totalDue", width: 15 },
            { header: "Status", key: "status", width: 15 }
        ];

        members.forEach(item => {
            sheet.addRow(item);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Member_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false
        });
    }
};


// ======================================
// Export PDF
// ======================================

const exportMemberPDF = async (req, res) => {
    try {
        const members = await getReportData();

        const doc = new PDFDocument({
            margin: 30,
            layout: 'landscape'
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Member_Report.pdf"
        );

        doc.pipe(res);

        doc.fontSize(18)
        .text(
            "Skylark Cooperative Society",
            {
                align: "center"
            }
        );

        doc.moveDown();

        doc.fontSize(12)
        .text(
            "Comprehensive Member Financial Report"
        );

        doc.moveDown();

        members.forEach((item) => {
            doc.text(
                `SL: ${item.sl} | ID: ${item.memberId} | Name: ${item.name} | Phone: ${item.phone} | Fixed Dep: ${item.fixedDeposit} | Dep: ${item.totalDeposit} | With: ${item.totalWithdrawal} | Loan: ${item.totalLoan} | Pen: ${item.totalPenalty} | Adv: ${item.advance} | Due: ${item.totalDue} | Status: ${item.status}`
            );
        });

        doc.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "PDF Export Failed"
        });
    }
};


// ======================================
// Common Data Function (Excel/PDF helper)
// ======================================

const getReportData = async () => {
    const members = await Member.find();
    const result = [];
    const totalFixedDeposit = calculateTotalFixedDeposit();

    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const memberMongoId = member._id;

        const summary = await calculateMemberSummary(
            memberMongoId
        ).catch(() => ({}));

        const deposit = await Deposit.aggregate([
            {
                $match: {
                    $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const withdrawal = await Withdrawal.aggregate([
            {
                $match: {
                    $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const loan = await Loan.aggregate([
            {
                $match: {
                    $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const penalty = await Penalty.aggregate([
            {
                $match: {
                    $or: [{ memberId: memberMongoId }, { member: memberMongoId }]
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        result.push({
            sl: i + 1,
            memberId: member.memberId,
            name: member.name,
            phone: member.phone,
            fixedDeposit: totalFixedDeposit,
            totalDeposit: deposit.length ? deposit[0].total : 0,
            totalWithdrawal: withdrawal.length ? withdrawal[0].total : 0,
            totalLoan: loan.length ? loan[0].total : 0,
            totalPenalty: penalty.length ? penalty[0].total : (summary.totalPenalty || 0),
            advance: summary.advance || 0,
            totalDue: summary.totalDue || 0,
            status: member.status
        });
    }

    return result;
};


module.exports = {
    getMemberReport,
    exportMemberExcel,
    exportMemberPDF
};