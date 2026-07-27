import { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  Wallet,
  TrendingDown,
  UserCheck,
  FileText,
  FileSpreadsheet,
  Printer
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";

function Reports(){
  const API = "https://skylark-cooperative-system.onrender.com/api";

  const [report,setReport] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadReport();
  },[]);

  // ============================
  // Load Report & Sort by Member ID
  // ============================
  const loadReport = async()=>{
    try{
      const res = await axios.get(`${API}/reports/members`);

      if(res.data.success){
        let membersData = res.data.report || [];
        
        // মেম্বার আইডি অনুযায়ী ছোট থেকে বড় (Ascending) সাজানো
        membersData.sort((a, b) => {
          const idA = String(a.memberId || "").trim();
          const idB = String(b.memberId || "").trim();
          return idA.localeCompare(idB, undefined, { numeric: true });
        });

        setReport(membersData);
      }
    }
    catch(error){
      console.log("Report Error:", error);
    }
    finally{
      setLoading(false);
    }
  };

  // ============================
  // Summary
  // ============================
  const totalMembers = report.length;

  const totalDeposit = report.reduce(
    (sum,item)=> sum + Number(item.totalDeposit || 0),
    0
  );

  const totalDue = report.reduce(
    (sum,item)=> sum + Number(item.totalDue || 0),
    0
  );

  const activeMembers = report.filter(
    item=>item.status==="Active"
  ).length;

  // ============================
  // PDF Export
  // ============================
  const exportPDF = ()=>{
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape mode for wider table

    doc.setFontSize(16);
    doc.text("Skylark Cooperative Society", 14, 15);

    doc.setFontSize(12);
    doc.text("Member Financial Report", 14, 23);

    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc,{
      startY: 38,
      head: [
        [
          "SL",
          "Member ID",
          "Name",
          "Phone",
          "Fixed Deposit",
          "Deposit",
          "Withdrawal",
          "Loan",
          "Penalty",
          "Advance",
          "Due",
          "Current Balance"
        ]
      ],
      body: report.map((item, index)=>[
        index + 1,
        item.memberId,
        item.name,
        item.phone,
        `৳ ${item.fixedDeposit || 0}`,
        `৳ ${item.totalDeposit || 0}`,
        `৳ ${item.totalWithdrawal || 0}`,
        `৳ ${item.totalLoan || 0}`,
        `৳ ${item.totalPenalty || 0}`,
        `৳ ${item.advance || 0}`,
        `৳ ${item.totalDue || 0}`,
        `৳ ${item.currentBalance || 0}`
      ]),
      styles: { fontSize: 8 }
    });

    doc.save("Skylark-Member-Report.pdf");
  };

  // ============================
  // Excel Export
  // ============================
  const exportExcel = ()=>{
    const data = report.map((item, index)=>({
      "SL": index + 1,
      "Member ID": item.memberId,
      "Name": item.name,
      "Phone": item.phone,
      "Status": item.status,
      "Fixed Deposit": item.fixedDeposit || 0,
      "Total Deposit": item.totalDeposit || 0,
      "Total Withdrawal": item.totalWithdrawal || 0,
      "Total Loan": item.totalLoan || 0,
      "Total Penalty": item.totalPenalty || 0,
      "Advance": item.advance || 0,
      "Total Due": item.totalDue || 0,
      "Current Balance": item.currentBalance || 0
    }));

    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet, "Member Report");
    XLSX.writeFile(book, "Skylark-Member-Report.xlsx");
  };

  // ============================
  // Print
  // ============================
  const printReport = ()=>{
    window.print();
  };

  if(loading){
    return(
      <div className="p-10 text-center text-xl font-bold">
        Loading Report...
      </div>
    );
  }

  return(
    <div className="space-y-8" id="printArea">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          Skylark Cooperative Society
        </h1>
        <h2 className="text-xl mt-2 font-semibold text-gray-700">
          Member Financial Report
        </h2>
        <p className="text-gray-500 mt-1">
          Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Members"
          value={totalMembers}
          icon={<Users/>}
          color="text-blue-600"
        />

        <SummaryCard
          title="Active Members"
          value={activeMembers}
          icon={<UserCheck/>}
          color="text-green-600"
        />

        <SummaryCard
          title="Total Deposit"
          value={`৳ ${totalDeposit.toLocaleString()}`}
          icon={<Wallet/>}
          color="text-purple-600"
        />

        <SummaryCard
          title="Total Due"
          value={`৳ ${totalDue.toLocaleString()}`}
          icon={<TrendingDown/>}
          color="text-red-600"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 flex-wrap no-print">
        <button
          onClick={exportPDF}
          className="bg-red-600 hover:bg-red-700 transition text-white px-5 py-3 rounded-lg flex gap-2 items-center font-medium shadow-sm"
        >
          <FileText/>
          PDF
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-3 rounded-lg flex gap-2 items-center font-medium shadow-sm"
        >
          <FileSpreadsheet/>
          Excel
        </button>

        <button
          onClick={printReport}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg flex gap-2 items-center font-medium shadow-sm"
        >
          <Printer/>
          Print
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden p-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border border-slate-700 p-3 text-center">SL</th>
                <th className="border border-slate-700 p-3 whitespace-nowrap">Member ID</th>
                <th className="border border-slate-700 p-3 whitespace-nowrap">Name</th>
                <th className="border border-slate-700 p-3 whitespace-nowrap">Phone</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Fixed Deposit</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Deposit</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Withdrawal</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Loan</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Penalty</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Advance</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Due</th>
                <th className="border border-slate-700 p-3 text-center whitespace-nowrap">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {
                report.map((item,index)=>(
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-center text-gray-600 font-medium">{index + 1}</td>
                    <td className="border border-gray-200 p-3 whitespace-nowrap font-semibold text-gray-800">{item.memberId}</td>
                    <td className="border border-gray-200 p-3 whitespace-nowrap font-semibold text-gray-900">{item.name}</td>
                    <td className="border border-gray-200 p-3 whitespace-nowrap text-gray-600">{item.phone}</td>
                    <td className="border border-gray-200 p-3 text-center text-indigo-700 font-semibold whitespace-nowrap">৳ {Number(item.fixedDeposit || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-emerald-700 font-semibold whitespace-nowrap">৳ {Number(item.totalDeposit || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-amber-700 font-semibold whitespace-nowrap">৳ {Number(item.totalWithdrawal || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-blue-700 font-semibold whitespace-nowrap">৳ {Number(item.totalLoan || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-rose-600 font-semibold whitespace-nowrap">৳ {Number(item.totalPenalty || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700 font-semibold whitespace-nowrap">৳ {Number(item.advance || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-red-600 font-semibold whitespace-nowrap">৳ {Number(item.totalDue || 0).toLocaleString()}</td>
                    <td className="border border-gray-200 p-3 text-center text-teal-800 font-bold whitespace-nowrap bg-gray-50">৳ {Number(item.currentBalance || 0).toLocaleString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-16 flex justify-between text-center font-medium text-gray-700">
        <div>
          ____________________
          <br/>
          Prepared By
        </div>

        <div>
          ____________________
          <br/>
          Authorized Signature
        </div>
      </div>

    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color
}){
  return(
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h2 className={`text-3xl font-bold mt-1 ${color}`}>
            {value}
          </h2>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Reports;