const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.Mixed, // ObjectId অথবা String উভয়ই একসেপ্ট করবে
        required: true
    },
    memberId: {
        type: String // যাতে কাস্টম আইডি (যেমন SKY-202305) সেভ করলে কোনো এরর না দেয়
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    receiptNo: {
        type: String,
        unique: true,
        sparse: true // একাধিক নাল ভ্যালু বা মিসিং রিসিট নাম থাকলে যেন এরর না খায়
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Penalty', penaltySchema);