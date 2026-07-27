const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const Loan = require("../models/Loan");
const Penalty = require("../models/Penalty");
const { calculateMemberSummary } = require("../services/dueCalculator");

const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


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

            // Fixed Deposit Amount Calculation (সদস্যের জয়েনিং মাস থেকে বর্তমান মাস পর্যন্ত প্রতি মাসের ফিক্সড জমার পরিমাণ স্বয়ংক্রিয়ভাবে হিসাব হবে)
            let fixedDepositAmount = member.monthlyDeposit || member.fixedDeposit || 1000; 
            const joiningDate = new Date(member.joiningDate || member.createdAt);
            const currentDate = new Date();
            const monthsPassed = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + (currentDate.getMonth() - joiningDate.getMonth()) + 1;
            const totalFixedDeposit = fixedDepositAmount * (monthsPassed > 0 ? monthsPassed : 1);

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
            success: false
        });
    }
};


// ======================================
// Common Data Function
// ======================================

const getReportData = async () => {
    const members = await Member.find();
    const result = [];

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

        let fixedDepositAmount = member.monthlyDeposit || member.fixedDeposit || 1000;
        const joiningDate = new Date(member.joiningDate || member.createdAt);
        const currentDate = new Date();
        const monthsPassed = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + (currentDate.getMonth() - joiningDate.getMonth()) + 1;
        const totalFixedDeposit = fixedDepositAmount * (monthsPassed > 0 ? monthsPassed : 1);

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