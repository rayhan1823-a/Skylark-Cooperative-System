import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Printer, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

function PenaltyReceipt() {
  const API = "https://skylark-cooperative-system.onrender.com/api";

  const { id } = useParams();
  const navigate = useNavigate();
  const [penalty, setPenalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPenaltyDetails = async () => {
      try {
        const res = await axios.get(`${API}/penalties/${id}`);
        if (res.data && res.data.success) {
          setPenalty(res.data.penalty);
        }
      } catch (error) {
        console.error("Error fetching penalty receipt:", error);
        toast.error("Failed to load receipt details");
      } finally {
        setLoading(false);
      }
    };

    fetchPenaltyDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 text-lg">Loading Receipt...</p>
        </div>
      </MainLayout>
    );
  }

  if (!penalty) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <p className="text-red-500 text-lg font-semibold">Penalty Receipt not found!</p>
          <button
            onClick={() => navigate("/penalties")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Penalties
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Action Buttons (Hidden on Print) */}
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate("/penalties")}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow transition"
          >
            <Printer size={18} /> Print Receipt
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border space-y-6 print:shadow-none print:border-none print:p-0">
          
          {/* Header with Logo */}
          <div className="text-center border-b pb-6 space-y-2">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="Society Logo" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-blue-900">Skylark Cooperative Society</h1>
            <p className="text-sm text-gray-500">Digital Cooperative Management System</p>
            <h2 className="text-lg font-bold text-gray-800 pt-2 uppercase tracking-wide">Penalty Payment Receipt</h2>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 py-2">
            <div>
              <p><strong className="text-gray-900">Receipt No:</strong> {penalty.receiptNo || "N/A"}</p>
              <p className="mt-2"><strong className="text-gray-900">Date:</strong> {new Date(penalty.createdAt || penalty.date || Date.now()).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p><strong className="text-gray-900">Status:</strong> 
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${penalty.status === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {penalty.status || "Paid"}
                </span>
              </p>
            </div>
          </div>

          {/* Member Info */}
          <div className="bg-gray-50 p-4 rounded-xl border space-y-1">
            <p><strong className="text-gray-700">Member Name:</strong> {penalty.member?.name || penalty.member?.fullName || "N/A"}</p>
            <p><strong className="text-gray-700">Member ID:</strong> {penalty.member?.memberId || "N/A"}</p>
          </div>

          {/* Reason & Amount Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b">
                  <th className="px-4 py-3">Description / Reason</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 divide-y">
                <tr>
                  <td className="px-4 py-4">{penalty.reason || penalty.note || "Penalty Fine"}</td>
                  <td className="px-4 py-4 text-right font-bold text-red-600">৳ {Number(penalty.amount || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2 text-base">
                <span>Total Payable:</span>
                <span className="text-red-600">৳ {Number(penalty.amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures with Auto Signature Image */}
          <div className="grid grid-cols-2 gap-10 pt-16 text-center text-sm text-gray-600 items-end">
            <div>
              <div className="border-t pt-2 font-medium">Member's Signature</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-1">
                <img src="/signature.png" alt="Authorized Signature" className="h-10 object-contain mx-auto" />
              </div>
              <div className="border-t pt-2 font-medium w-full">Authorized Signature</div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default PenaltyReceipt;