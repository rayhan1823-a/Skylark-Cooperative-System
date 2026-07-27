const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const Loan = require("../models/Loan");
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

        for (const member of members) {
            const summary = await calculateMemberSummary(
                member._id
            );

            // Total Deposit
            const deposit = await Deposit.aggregate([
                {
                    $match: {
                        memberId: member._id
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
                        memberId: member._id
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
                        memberId: member._id
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
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                joiningDate: member.joiningDate,
                status: member.status,
                totalDeposit: deposit.length ? deposit[0].total : 0,
                totalWithdrawal: withdrawal.length ? withdrawal[0].total : 0,
                totalLoan: loan.length ? loan[0].total : 0,
                totalPenalty: summary.totalPenalty || 0,
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
            { header: "Member Name", key: "name", width: 25 },
            { header: "Member ID", key: "memberId", width: 15 },
            { header: "Phone", key: "phone", width: 15 },
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

        members.forEach((item, index) => {
            doc.text(
                `${index + 1}. Name: ${item.name} | ID: ${item.memberId} | Phone: ${item.phone} | Deposit: ${item.totalDeposit} | Withdrawal: ${item.totalWithdrawal} | Loan: ${item.totalLoan} | Penalty: ${item.totalPenalty} | Advance: ${item.advance} | Due: ${item.totalDue} | Status: ${item.status}`
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

    for (const member of members) {
        const summary = await calculateMemberSummary(
            member._id
        );

        const deposit = await Deposit.aggregate([
            {
                $match: {
                    memberId: member._id
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
                    memberId: member._id
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
                    memberId: member._id
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
            memberId: member.memberId,
            name: member.name,
            phone: member.phone,
            totalDeposit: deposit.length ? deposit[0].total : 0,
            totalWithdrawal: withdrawal.length ? withdrawal[0].total : 0,
            totalLoan: loan.length ? loan[0].total : 0,
            totalPenalty: summary.totalPenalty || 0,
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