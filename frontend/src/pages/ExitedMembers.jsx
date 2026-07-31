import { useEffect, useState } from "react";
import axios from "axios";

function ExitedMembers() {
  const [exitedMembers, setExitedMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]); // ড্রপডাউনের জন্য সব মেম্বার
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // নতুন এক্সিট এন্ট্রি মোডাল
  const [selectedMember, setSelectedMember] = useState(null); // এডিট মোডাল বা ড্রয়ার ওপেন করার জন্য
  const [editFormData, setEditFormData] = useState({
    memberId: "",
    exitDate: "",
    refundAmount: "",
    exitReason: ""
  });

  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  // ইউজারের রোল চেক করা (SUPER_ADMIN কিনা যাচাই করার জন্য)
  let userRole = "";
  try {
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    userRole = userObj.role || localStorage.getItem("role") || "";
  } catch (e) {
    userRole = localStorage.getItem("role") || "";
  }
  
  const isSuperAdmin = userRole.toUpperCase() === "SUPER_ADMIN";

  // সব মেম্বার ফেচ করে শুধু যাদের স্ট্যাটাস "Exited" তাদের ফিল্টার করব এবং বাকিদের ড্রপডাউনের জন্য রাখব
  const loadExitedMembers = async () => {
    try {
      const res = await axios.get(
        `https://skylark-cooperative-system.onrender.com/api/members`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const allMembersData = res.data.members || res.data.data || res.data || [];
      
      setAllMembers(allMembersData);
      
      // শুধুমাত্র Exited মেম্বারদের ফিল্টার করা
      const exited = allMembersData.filter(
        (m) => m.status && m.status.toLowerCase() === "exited"
      );
      setExitedMembers(exited);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExitedMembers();
  }, []);

  // এক্সিট ইনফো এডিট করার জন্য মোডাল ওপেন করা
  const handleOpenEdit = (member) => {
    if (!isSuperAdmin) {
      alert("❌ Access Denied! Only SUPER_ADMIN can edit exit info.");
      return;
    }
    setSelectedMember(member);
    setEditFormData({
      memberId: member._id,
      exitDate: member.exitDate ? member.exitDate.substring(0, 10) : "",
      refundAmount: member.refundAmount || "",
      exitReason: member.exitReason || ""
    });
  };

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // ড্রপডাউন থেকে মেম্বার সিলেক্ট করলে তার ID সেট করা
  const handleMemberSelect = (e) => {
    setEditFormData({
      ...editFormData,
      memberId: e.target.value
    });
  };

  // এক্সিট ডাটা সেভ বা আপডেট করা
  const handleSaveExitInfo = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("❌ Access Denied!");
      return;
    }

    try {
      const memberIdToUpdate = selectedMember ? selectedMember._id : editFormData.memberId;

      if (!memberIdToUpdate) {
        alert("❌ Please select a member");
        return;
      }

      const updatePayload = {
        status: "Exited",
        exitDate: editFormData.exitDate,
        refundAmount: editFormData.refundAmount,
        exitReason: editFormData.exitReason
      };

      await axios.put(
        `https://skylark-cooperative-system.onrender.com/api/members/${memberIdToUpdate}`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("✅ Exit details saved successfully!");
      setSelectedMember(null);
      setIsAddModalOpen(false);
      setEditFormData({ memberId: "", exitDate: "", refundAmount: "", exitReason: "" });
      loadExitedMembers(); // লিস্ট রিফ্রেশ করা
    } catch (error) {
      console.log(error);
      alert("❌ Failed to update exit details.");
    }
  };

  // 🗑️ মেম্বার ডিলিট বা এক্সিট স্ট্যাটাস রিমুভ করার ফাংশন (শুধু SUPER_ADMIN এর জন্য)
  const handleDeleteExit = async (memberId) => {
    if (!isSuperAdmin) {
      alert("❌ Access Denied! Only SUPER_ADMIN can delete exit records.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove/reset this exit record?")) {
      return;
    }

    try {
      await axios.put(
        `https://skylark-cooperative-system.onrender.com/api/members/${memberId}`,
        { status: "Active", exitDate: null, refundAmount: 0, exitReason: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Exit record deleted successfully!");
      loadExitedMembers();
    } catch (error) {
      console.log(error);
      alert("❌ Failed to delete exit record.");
    }
  };

  // 📊 রিপোর্টের জন্য ক্যালকুলেশন
  const totalExitedCount = exitedMembers.length;
  const totalRefundAmount = exitedMembers.reduce(
    (sum, m) => sum + Number(m.refundAmount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex-1 p-10 text-center text-xl bg-slate-50 min-h-screen flex items-center justify-center">
        Loading Exited Members...
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-blue-900">Exited Members Management</h1>
          
          {/* যদি SUPER_ADMIN না হয়, তবে বাটনটি disabled এবং gray হয়ে থাকবে */}
          <button
            onClick={() => {
              if (!isSuperAdmin) {
                alert("❌ Access Denied! Only SUPER_ADMIN can add exited members.");
                return;
              }
              setSelectedMember(null);
              setEditFormData({ memberId: "", exitDate: "", refundAmount: "", exitReason: "" });
              setIsAddModalOpen(true);
            }}
            disabled={!isSuperAdmin}
            className={`px-5 py-2.5 rounded-xl font-bold shadow transition flex items-center gap-2 ${
              isSuperAdmin 
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
            }`}
            title={!isSuperAdmin ? "Only SUPER_ADMIN can add exited members" : ""}
          >
            <span>+</span> Add Exited Member
          </button>
        </div>

        {/* 📊 ওপরের সামারি রিপোর্ট সেকশন */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Exited Members</p>
              <h2 className="text-3xl font-extrabold text-red-600 mt-1">{totalExitedCount}</h2>
            </div>
            <div className="p-4 bg-red-50 text-red-600 rounded-full text-xl font-bold">
              🚪
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Refund Amount</p>
              <h2 className="text-3xl font-extrabold text-green-600 mt-1">৳ {totalRefundAmount.toLocaleString()}</h2>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-full text-xl font-bold">
              💰
            </div>
          </div>
        </div>

        {/* মেম্বার লিস্ট টেবিল */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Exited Members List</h2>

          {exitedMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exited members found. Click "+ Add Exited Member" to add one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm border-b">
                    <th className="p-3">Member ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Exit Date</th>
                    <th className="p-3">Refund Amount</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y">
                  {exitedMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-800">{member.memberId || "N/A"}</td>
                      <td className="p-3 font-medium text-gray-900">{member.name}</td>
                      <td className="p-3">{member.phone}</td>
                      <td className="p-3">{member.exitDate ? member.exitDate.substring(0, 10) : <span className="text-amber-600 italic">Not set</span>}</td>
                      <td className="p-3 font-bold text-green-600">৳ {member.refundAmount || 0}</td>
                      <td className="p-3 truncate max-w-xs">{member.exitReason || "N/A"}</td>
                      <td className="p-3 text-center">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExit(member._id)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🛠️ এক্সিট ইনফো এন্ট্রি/এডিট করার মোডাল (Popup) */}
        {(selectedMember || isAddModalOpen) && isSuperAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedMember ? `Edit Exit Info: ${selectedMember.name}` : "Add New Exited Member"}
                </h3>
                <button
                  onClick={() => { setSelectedMember(null); setIsAddModalOpen(false); }}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveExitInfo} className="space-y-4">
                {/* যদি নতুন এন্ট্রি হয়, তবে ড্রপডাউন থেকে মেম্বার সিলেক্ট করতে হবে */}
                {!selectedMember && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Select Member</label>
                    <select
                      name="memberId"
                      value={editFormData.memberId}
                      onChange={handleMemberSelect}
                      className="border p-2.5 rounded-lg w-full bg-white"
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {allMembers
                        .filter(m => !m.status || m.status.toLowerCase() !== "exited")
                        .map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.memberId || "No ID"}) - {m.phone}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1">Exit Date</label>
                  <input
                    type="date"
                    name="exitDate"
                    value={editFormData.exitDate}
                    onChange={handleInputChange}
                    className="border p-2.5 rounded-lg w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Refund Amount (৳)</label>
                  <input
                    type="number"
                    name="refundAmount"
                    value={editFormData.refundAmount}
                    onChange={handleInputChange}
                    placeholder="Enter refund amount"
                    className="border p-2.5 rounded-lg w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Exit Reason / Notes</label>
                  <textarea
                    name="exitReason"
                    value={editFormData.exitReason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Why did the member exit?"
                    className="border p-2.5 rounded-lg w-full"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => { setSelectedMember(null); setIsAddModalOpen(false); }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExitedMembers;