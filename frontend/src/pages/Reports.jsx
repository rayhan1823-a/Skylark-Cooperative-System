import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
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

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    loadReport();
  },[]);

  // ============================
  // Load Report with Token Authentication
  // ============================
  const loadReport = async()=>{
    try{
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/reports/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if(res.data.success){
        setReport(res.data.report || []);
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
  // Summary Calculations
  // ============================
  const totalMembers = report.length;

  const totalDeposit = report.reduce(
    (sum, item)=> sum + Number(item.totalDeposit || 0),
    0
  );

  const totalDue = report.reduce(
    (sum, item)=> sum + Number(item.totalDue || 0),
    0
  );

  const activeMembers = report.filter(
    item => item.status === "Active"
  ).length;

  // ============================
  // PDF Export
  // ============================
  const exportPDF = ()=>{
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Skylark Cooperative Society", 14, 15);

    doc.setFontSize(12);
    doc.text("Member Financial Report", 14, 25);

    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 33);

    autoTable(doc,{
      startY: 45,
      head: [
        [
          "Member ID",
          "Name",
          "Phone",
          "Deposit",
          "Due"
        ]
      ],
      body: report.map(item=>[
        item.memberId || "N/A",
        item.name || "N/A",
        item.phone || "N/A",
        `৳ ${Number(item.totalDeposit || 0).toLocaleString()}`,
        `৳ ${Number(item.totalDue || 0).toLocaleString()}`
      ])
    });

    doc.save("Skylark-Member-Report.pdf");
  };

  // ============================
  // Excel Export
  // ============================
  const exportExcel = ()=>{
    const data = report.map(item=>({
      "Member ID": item.memberId,
      "Name": item.name,
      "Phone": item.phone,
      "Status": item.status,
      "Total Deposit": item.totalDeposit,
      "Total Due": item.totalDue
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
      <MainLayout>
        <div className="p-10 text-center text-xl font-bold text-indigo-600">
          Loading Report...
        </div>
      </MainLayout>
    );
  }

  return(
    <MainLayout>
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/30 min-h-screen" id="printArea">

        {/* Header */}
        <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-blue-700 tracking-tight">
            Skylark Cooperative Society
          </h1>
          <h2 className="text-lg md:text-xl font-bold text-slate-700 mt-1">
            Member Financial Report
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Members"
            value={totalMembers}
            icon={<Users size={24}/>}
            color="text-blue-600"
          />

          <SummaryCard
            title="Active Members"
            value={activeMembers}
            icon={<UserCheck size={24}/>}
            color="text-emerald-600"
          />

          <SummaryCard
            title="Total Deposit"
            value={`৳ ${totalDeposit.toLocaleString()}`}
            icon={<Wallet size={24}/>}
            color="text-purple-600"
          />

          <SummaryCard
            title="Total Due"
            value={`৳ ${totalDue.toLocaleString()}`}
            icon={<TrendingDown size={24}/>}
            color="text-rose-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap no-print">
          <button
            onClick={exportPDF}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold flex gap-2 items-center shadow-md transition cursor-pointer"
          >
            <FileText size={18}/>
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex gap-2 items-center shadow-md transition cursor-pointer"
          >
            <FileSpreadsheet size={18}/>
            Export Excel
          </button>

          <button
            onClick={printReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex gap-2 items-center shadow-md transition cursor-pointer"
          >
            <Printer size={18}/>
            Print Report
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Member ID</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4 text-right">Deposit</th>
                  <th className="px-5 py-4 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {report.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">No member report data found.</td>
                  </tr>
                ) : (
                  report.map((item, index)=>(
                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-700">{item.memberId || "N/A"}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{item.name || "N/A"}</td>
                      <td className="px-5 py-4 font-medium text-slate-600">{item.phone || "N/A"}</td>
                      <td className="px-5 py-4 text-right font-black text-emerald-600">৳ {Number(item.totalDeposit || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-black text-rose-600">৳ {Number(item.totalDue || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-16 pt-8 flex justify-between text-center text-sm font-semibold text-slate-700">
          <div>
            <div className="w-40 border-b border-slate-400 mb-2 mx-auto"></div>
            Prepared By
          </div>

          <div>
            <div className="w-40 border-b border-slate-400 mb-2 mx-auto"></div>
            Authorized Signature
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color
}){
  return(
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h2 className={`text-2xl font-black mt-1 ${color}`}>
          {value}
        </h2>
      </div>
      <div className={`p-3.5 bg-slate-50 rounded-2xl shadow-inner ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default Reports;