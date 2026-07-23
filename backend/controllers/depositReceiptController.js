const Deposit = require("../models/Deposit");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getDepositReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findById(id).populate("memberId", "memberId name phone fatherName address nid photo");

    if (!deposit) return res.status(404).json({ success: false, message: "Deposit not found" });

    const member = deposit.memberId;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Receipt-${deposit.receiptNo}.pdf"`);
    doc.pipe(res);

    // লোগো সেকশন
    const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 255, 20, { width: 100 }); 
    }

    doc.moveDown(7);
    doc.fillColor('#003366').fontSize(22).font('Helvetica-Bold').text("Skylark Cooperative Society", { align: 'center' });
    doc.fillColor('black').fontSize(12).font('Helvetica').text("Deposit Money Receipt", { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // সুন্দর অ্যালাইনমেন্টের জন্য কোলন পজিশন ফিক্সড
    const labelX = 50;
    const colonX = 150; // কোলনের পজিশন
    const valueX = 160; // তথ্যের পজিশন
    const startY = doc.y;

    doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold');
    
    // বাম পাশের কলাম
    const fields = [
        { label: "Receipt No", value: deposit.receiptNo },
        { label: "Member ID", value: member?.memberId },
        { label: "Member Name", value: member?.name },
        { label: "Phone", value: member?.phone },
        { label: "Father Name", value: member?.fatherName },
        { label: "NID", value: member?.nid }
    ];

    fields.forEach((field, i) => {
        const y = startY + (i * 18);
        doc.font('Helvetica-Bold').text(field.label, labelX, y);
        doc.text(":", colonX, y);
        doc.font('Helvetica').text(field.value, valueX, y);
    });

    // ডান পাশের কলাম
    const rightFields = [
        { label: "Date", value: new Date(deposit.depositDate).toLocaleDateString() },
        { label: "Month", value: deposit.month },
        { label: "Year", value: deposit.year },
        { label: "Method", value: deposit.paymentMethod }
    ];

    rightFields.forEach((field, i) => {
        const y = startY + (i * 18);
        doc.font('Helvetica-Bold').text(field.label, 350, y);
        doc.text(":", 410, y);
        doc.font('Helvetica').text(field.value, 420, y);
    });

    // টেবিল
    doc.moveDown(8);
    const tableY = doc.y;
    doc.fillColor('#003366').rect(50, tableY, 500, 20).fill();
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold').text("Description", 60, tableY + 5);
    doc.text("Amount", 480, tableY + 5);

    doc.fillColor('black').font('Helvetica').text("Monthly Deposit", 55, tableY + 30);
    doc.text(`${deposit.amount} Taka`, 480, tableY + 30);
    doc.moveDown(2);
    doc.strokeColor('#aaaaaa').moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // সিগনেচার সেকশন
    doc.moveDown(6);
    const sigY = doc.y;
    doc.strokeColor('black').moveTo(50, sigY).lineTo(200, sigY).stroke();
    doc.text("Member Signature", 55, sigY + 5);
    
    const sigPath = path.join(__dirname, '../../frontend/public/signature.png');
    if (fs.existsSync(sigPath)) {
        doc.image(sigPath, 400, sigY - 40, { width: 80 });
    }
    doc.moveTo(380, sigY).lineTo(530, sigY).stroke();
    doc.text("Authorized Signature", 390, sigY + 5);

    doc.end();
  } catch (error) {
    console.error("Receipt Error:", error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getDepositReceipt };