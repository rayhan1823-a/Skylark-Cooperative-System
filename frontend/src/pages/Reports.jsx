import { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  Wallet,
  TrendingDown,
  UserCheck,
  UserX,
  UserMinus,
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
        
        // মেম্বার আইডি অনুযায়ী ছোট থেকে বড় (Ascending) সাজানো
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
    item => String(item.status || "").toLowerCase() === "active"
  ).length;

  const inactiveMembers = report.filter(
    item => String(item.status || "").toLowerCase() === "inactive"
  ).length;

  const exitedMembers = report.filter(
    item => ["exited", "exit", "left", "closed"].includes(String(item.status || "").toLowerCase())
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
          "Member Status",
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
        item.status || "Active",
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
      "Member Status": item.status || "Active",
      "Phone": item.phone,
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

      {/* Header with Logo */}
      <div className="text-center flex flex-col items-center justify-center space-y-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner overflow-hidden p-1">
          <img 
            src="https://skylark-cooperative-system.onrender.com/logo.png" 
            onError={(e)=>{e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}} 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">
            Skylark Cooperative Society
          </h1>
          <h2 className="text-lg font-semibold text-gray-600 mt-1">
            Member Financial Report
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Professional & Premium Summary Cards - 4 cards per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Members"
          value={totalMembers}
          icon={<Users className="w-6 h-6"/>}
          color="text-blue-700"
          bgIcon="bg-blue-50 border border-blue-100"
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
          borderColor="border-blue-100"
        />

        <SummaryCard
          title="Active Members"
          value={activeMembers}
          icon={<UserCheck className="w-6 h-6"/>}
          color="text-emerald-700"
          bgIcon="bg-emerald-50 border border-emerald-100"
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
          borderColor="border-emerald-100"
        />

        <SummaryCard
          title="Inactive Members"
          value={inactiveMembers}
          icon={<UserX className="w-6 h-6"/>}
          color="text-amber-700"
          bgIcon="bg-amber-50 border border-amber-100"
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
          borderColor="border-amber-100"
        />

        <SummaryCard
          title="Exits Member"
          value={exitedMembers}
          icon={<UserMinus className="w-6 h-6"/>}
          color="text-rose-700"
          bgIcon="bg-rose-50 border border-rose-100"
          gradient="from-rose-500/10 via-rose-500/5 to-transparent"
          borderColor="border-rose-100"
        />

        <SummaryCard
          title="Total Deposit"
          value={`৳ ${totalDeposit.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6"/>}
          color="text-purple-700"
          bgIcon="bg-purple-50 border border-purple-100"
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
          borderColor="border-purple-100"
        />

        <SummaryCard
          title="Total Due"
          value={`৳ ${totalDue.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6"/>}
          color="text-red-600"
          bgIcon="bg-red-50 border border-red-100"
          gradient="from-red-500/10 via-red-500/5 to-transparent"
          borderColor="border-red-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 flex-wrap no-print">
        <button
          onClick={exportPDF}
          className="bg-red-600 hover:bg-red-700 transition text-white px-5 py-2.5 rounded-xl flex gap-2 items-center font-medium shadow-sm"
        >
          <FileText className="w-4 h-4"/>
          PDF
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-xl flex gap-2 items-center font-medium shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4"/>
          Excel
        </button>

        <button
          onClick={printReport}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2.5 rounded-xl flex gap-2 items-center font-medium shadow-sm"
        >
          <Printer className="w-4 h-4"/>
          Print
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-800 p-3 text-center">SL</th>
                <th className="border border-slate-800 p-3 whitespace-nowrap">Member ID</th>
                <th className="border border-slate-800 p-3 whitespace-nowrap">Name</th>
                <th className="border border-slate-800 p-3 whitespace-nowrap text-center">Member Status</th>
                <th className="border border-slate-800 p-3 whitespace-nowrap">Phone</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Fixed Deposit</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Deposit</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Withdrawal</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Loan</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Penalty</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Advance</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Due</th>
                <th className="border border-slate-800 p-3 text-center whitespace-nowrap">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {
                report.map((item,index)=>(
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-center text-gray-600 font-medium">{index + 1}</td>
                    <td className="border border-gray-200 p-3 whitespace-nowrap font-semibold text-gray-800">{item.memberId}</td>
                    <td className="border border-gray-200 p-3 whitespace-nowrap font-semibold text-gray-900">{item.name}</td>
                    <td className="border border-gray-200 p-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        String(item.status || "").toLowerCase() === "active" 
                          ? "bg-green-50 text-green-700" 
                          : String(item.status || "").toLowerCase() === "inactive"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {item.status || "Active"}
                      </span>
                    </td>
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

      {/* Signature Section */}
      <div className="mt-20 flex justify-between items-center text-center font-medium text-gray-700 px-6">
        <div className="border-t-2 border-gray-400 w-56 pt-2">
          Prepared By
        </div>

        <div className="border-t-2 border-gray-400 w-56 pt-2">
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
  color,
  bgIcon,
  gradient,
  borderColor
}){
  return(
    <div className={`relative bg-white bg-gradient-to-br ${gradient} shadow-sm hover:shadow-md transition-all duration-300 border ${borderColor} rounded-2xl p-4 overflow-hidden group`}>
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider truncate">{title}</p>
          <h2 className={`text-xl sm:text-2xl font-black mt-1 ${color} tracking-tight truncate`}>
            {value}
          </h2>
        </div>
        <div className={`p-2.5 rounded-xl ${bgIcon} ${color} shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Reports;