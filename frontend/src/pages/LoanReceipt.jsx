import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function LoanReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API = "http://localhost:5000/api";

  // টেবিল পেজ থেকে state এর মাধ্যমে পাঠানো রিসিট নম্বর বা লোন ডেটা আগে চেক করা হচ্ছে
  const [loan, setLoan] = useState(location.state?.loan || null);
  const [passedReceiptNo] = useState(location.state?.receiptNo || null);
  const [loading, setLoading] = useState(!location.state?.loan);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    if (!loan) {
      fetchLoanReceipt();
    }
  }, [id]);

  const fetchLoanReceipt = async () => {
    try {
      const res = await axios.get(`${API}/loans/${id}`, getAuthHeader());
      console.log("Loan Data Response:", res.data);
      setLoan(res.data.loan || res.data.data || res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to load loan receipt data.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-10 text-xl font-semibold">Loading Receipt...</div>
      </MainLayout>
    );
  }

  if (!loan) {
    return (
      <MainLayout>
        <div className="text-center py-10 text-xl text-red-600 font-semibold">Loan Receipt Not Found</div>
      </MainLayout>
    );
  }

  // ১০০% নিশ্চিত সঠিক রিসিট নম্বর পাওয়ার সিকোয়েন্স
  const receiptNo = 
    passedReceiptNo || 
    loan.receiptNo || 
    loan.receipt_no || 
    loan.loanNo || 
    (loan._id ? `SKY-LOAN-${loan._id.slice(-6).toUpperCase()}` : "SKY-LOAN-000001");

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 print:shadow-none print:p-0 print:m-0 print:w-full">
        {/* Action Buttons (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate("/loans")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Loans
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <span>🖨️ Print Receipt</span>
          </button>
        </div>

        {/* Receipt Box */}
        <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50 print:border-none print:bg-white print:p-2">
          
          {/* Header with Logo */}
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-14 h-14 object-contain" 
              />
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Skylark Cooperative Society</h2>
                <p className="text-sm text-gray-500">Digital Cooperative Management System</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Original Copy
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide underline">Loan Money Receipt</h3>
          </div>

          {/* Receipt Meta Info */}
          <div className="flex justify-between mb-6 text-sm bg-white p-4 rounded-md border shadow-sm">
            <div>
              <p className="mb-2"><span className="font-semibold text-gray-600">Receipt No:</span> <span className="text-blue-700 font-bold">{receiptNo}</span></p>
              <p><span className="font-semibold text-gray-600">Issue Date:</span> {loan.issueDate ? new Date(loan.issueDate).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="mb-2"><span className="font-semibold text-gray-600">Due Date:</span> {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Status:</span> <span className={loan.status === "Paid" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{loan.status}</span></p>
            </div>
          </div>

          {/* Member Information */}
          <div className="mb-6 bg-white p-4 rounded-md border shadow-sm">
            <h4 className="text-gray-700 font-bold mb-2 border-b pb-1">Member Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="font-semibold text-gray-600">Member ID:</span> {loan.member?.memberId || loan.memberId || "N/A"}</p>
              <p><span className="font-semibold text-gray-600">Name:</span> {loan.member?.name || loan.memberName || "N/A"}</p>
              <p className="col-span-2"><span className="font-semibold text-gray-600">Phone:</span> {loan.member?.phone || loan.phone || "N/A"}</p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-8">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 text-sm">
                    Loan Disbursement {loan.remarks ? <span className="text-gray-500 block text-xs mt-1">(Remarks: {loan.remarks})</span> : ""}
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-bold text-lg text-blue-900">
                    ৳ {loan.amount ? loan.amount.toLocaleString() : "0"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-300 text-center">
            <div className="w-1/3">
              <div className="h-10 mb-1 flex justify-center items-center"></div>
              <p className="border-t border-gray-400 pt-1 text-sm font-semibold text-gray-700">Receiver's Signature</p>
            </div>
            <div className="w-1/3">
              <div className="h-10 mb-1 flex justify-center items-center">
                <img 
                  src="/signature.png" 
                  alt="Authorized Signature" 
                  className="max-h-12 object-contain" 
                />
              </div>
              <p className="border-t border-gray-400 pt-1 text-sm font-semibold text-gray-700">Authorized Signature</p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default LoanReceipt;