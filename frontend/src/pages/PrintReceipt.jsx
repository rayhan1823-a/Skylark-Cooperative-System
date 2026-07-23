import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

const API = "https://skylark-cooperative-system.onrender.com/api";

function PrintReceipt() {
  const { id } = useParams();
  const printRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      const res = await axios.get(`${API}/deposit-receipt/${id}`, getConfig());
      if (res.data.success) {
        setReceipt(res.data.receipt);
      }
    } catch (error) {
      console.error("Receipt Error:", error);
      alert("Receipt Not Found");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // তারিখ ফরম্যাট করার আপডেট লজিক
  const getFormattedDate = () => {
    if (!receipt) return "";

    // ১. ডাটাবেজ থেকে আসা depositDate (সবচেয়ে সঠিক)
    if (receipt.deposit?.depositDate) {
      return new Date(receipt.deposit.depositDate).toLocaleDateString("en-GB");
    }

    // ২. fallback (যদি depositDate না থাকে)
    return new Date().toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-xl font-bold">Loading Receipt...</div>
      </MainLayout>
    );
  }

  if (!receipt) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-red-600 text-xl">Receipt Not Found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-end mb-5">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          🖨 Print Receipt
        </button>
      </div>

      <div ref={printRef} className="bg-white shadow-xl rounded-xl p-10 max-w-4xl mx-auto">
        <div className="text-center border-b pb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">Skylark Cooperative Society</h1>
          <p className="text-gray-500">Deposit Money Receipt</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <p><b>Receipt No :</b> {receipt.receiptNo}</p>
            <p><b>Member ID :</b> {receipt.member.memberId}</p>
            <p><b>Member Name :</b> {receipt.member.name}</p>
            <p><b>Phone :</b> {receipt.member.phone}</p>
            <p><b>Father :</b> {receipt.member.fatherName || "-"}</p>
            <p><b>NID :</b> {receipt.member.nid || "-"}</p>
          </div>

          <div className="text-right">
            <p><b>Date :</b> {getFormattedDate()}</p>
            <p><b>Month :</b> {receipt.deposit.month}</p>
            <p><b>Year :</b> {receipt.deposit.year}</p>
            <p><b>Method :</b> {receipt.deposit.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-10 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Month</th>
                <th className="p-4 text-center">Year</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-4">Monthly Deposit</td>
                <td className="text-center">{receipt.deposit.month}</td>
                <td className="text-center">{receipt.deposit.year}</td>
                <td className="text-right font-bold text-green-700 pr-4">
                  ৳ {Number(receipt.deposit.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <p className="font-semibold">Note :</p>
          <div className="border rounded-lg p-4 mt-2 min-h-[70px]">
            {receipt.deposit.note || "No Note"}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-80">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 font-semibold">Deposit Amount</td>
                  <td className="text-right font-bold text-xl text-green-700">
                    ৳ {Number(receipt.deposit.amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-end mt-28 px-4">
          <div className="text-center w-52">
            <div className="border-t border-black w-full mb-2"></div>
            <p className="text-sm font-semibold text-gray-700">Member Signature</p>
          </div>
          <div className="text-center w-52 flex flex-col items-center">
            <img 
              src="/signature.png" 
              alt="Authorized Signature" 
              className="h-12 object-contain mb-1 signature-img" 
              onError={(e) => e.target.style.display = 'none'} 
            />
            <div className="border-t border-black w-full mb-2"></div>
            <p className="text-sm font-semibold text-gray-700">Authorized Signature</p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500">
          <p>This is a computer generated receipt.</p>
          <p>Skylark Cooperative Society</p>
        </div>
      </div>

      <style>
        {`
        @media print {
          body { background: #ffffff !important; }
          nav, aside, button { display: none !important; }
          .shadow-xl { box-shadow: none !important; }
          .max-w-4xl { max-width: 100% !important; padding: 0 !important; }
          @page { size: A4; margin: 15mm; }
        }
        `}
      </style>
    </MainLayout>
  );
}

export default PrintReceipt;