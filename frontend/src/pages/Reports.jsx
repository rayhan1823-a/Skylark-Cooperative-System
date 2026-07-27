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
  // Load Report
  // ============================
  const loadReport = async()=>{
    try{
      const res = await axios.get(`${API}/reports/members`);

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
        item.memberId,
        item.name,
        item.phone,
        `৳ ${item.totalDeposit}`,
        `৳ ${item.totalDue}`
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
        <h2 className="text-xl mt-2">
          Member Financial Report
        </h2>
        <p className="text-gray-500">
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
          value={`৳ ${totalDeposit}`}
          icon={<Wallet/>}
          color="text-purple-600"
        />

        <SummaryCard
          title="Total Due"
          value={`৳ ${totalDue}`}
          icon={<TrendingDown/>}
          color="text-red-600"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 flex-wrap no-print">
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-5 py-3 rounded-lg flex gap-2 items-center"
        >
          <FileText/>
          PDF
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-3 rounded-lg flex gap-2 items-center"
        >
          <FileSpreadsheet/>
          Excel
        </button>

        <button
          onClick={printReport}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg flex gap-2 items-center"
        >
          <Printer/>
          Print
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-auto p-5">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Member ID</th>
              <th className="border p-3">Name</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Deposit</th>
              <th className="border p-3">Due</th>
            </tr>
          </thead>
          <tbody>
            {
              report.map((item,index)=>(
                <tr key={index}>
                  <td className="border p-3">{item.memberId}</td>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">{item.phone}</td>
                  <td className="border p-3">৳ {item.totalDeposit}</td>
                  <td className="border p-3">৳ {item.totalDue}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="mt-16 flex justify-between text-center">
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
    <div className="bg-white shadow rounded-xl p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">{title}</p>
          <h2 className={`text-3xl font-bold ${color}`}>
            {value}
          </h2>
        </div>
        <div className={color}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Reports;