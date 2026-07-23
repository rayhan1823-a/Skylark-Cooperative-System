import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";

const API_URL = "https://skylark-cooperative-system.onrender.com";

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ইউজারের রোল এবং ফোন নম্বর ট্র্যাক করার স্টেট
  const [userRole, setUserRole] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে লগইন করা ইউজারের তথ্য বের করা (আগের কোনো লজিক নষ্ট না করে)
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(storedUser.role || localStorage.getItem("role") || "MEMBER");
      setUserPhone(storedUser.phone || storedUser.phoneNumber || localStorage.getItem("phone") || "");
    } catch (e) {
      setUserRole("MEMBER");
    }

    fetchMembers();
  }, []);

  // ==========================
  // Fetch Members (Updated with Token Header)
  // ==========================
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setMembers(res.data.members || []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error(error.response?.data?.message || "Failed to load members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Delete Member (Updated with Token Header)
  // ==========================
  const deleteMember = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this member?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/api/members/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Member Deleted Successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  // ==========================
  // Role & Search Filtering Logic
  // ==========================
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const filteredMembers = members.filter((member) => {
    // যদি ইউজার সাধারণ মেম্বার হয়, তবে সে শুধু তার নিজের ফোন নম্বরের মেম্বার কার্ডটিই দেখতে পাবে
    if (!isAdmin) {
      const cleanMemberPhone = (member.phone || "").trim();
      const cleanUserPhone = (userPhone || "").trim();
      if (cleanMemberPhone !== cleanUserPhone) {
        return false;
      }
    }

    const text = search.toLowerCase();
    return (
      member.memberId?.toLowerCase().includes(text) ||
      member.name?.toLowerCase().includes(text) ||
      member.phone?.includes(text)
    );
  });

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Members</h1>
        
        {/* শুধুমাত্র অ্যাডমিন হলে Add Member বাটন দেখাবে */}
        {isAdmin && (
          <Link
            to="/add-member"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-center shadow transition-colors"
          >
            + Add Member
          </Link>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Member ID, Name or Phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
      />

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4 font-semibold text-center">SL</th>
              <th className="p-4 font-semibold text-center">Photo</th>
              <th className="p-4 font-semibold">Member ID</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                  Loading Members...
                </td>
              </tr>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => {
                // ✅ আপনার আগের নিখুঁত ইমেজ পাথ হ্যান্ডলিং লজিক
                let imageUrl = "";
                if (member.photo) {
                  if (member.photo.startsWith("http")) {
                    imageUrl = member.photo;
                  } else {
                    const cleanFileName = member.photo.replace(/\\/g, '/').split('/').pop();
                    imageUrl = `${API_URL}/uploads/photos/${cleanFileName}`;
                  }
                }

                // আইডি সিলেকশন: কাস্টম memberId থাকলে সেটি পাস হবে, না থাকলে _id পাস হবে
                const targetId = member.memberId || member._id;

                return (
                  <tr key={member._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-center text-gray-700">{index + 1}</td>
                    
                    <td className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto relative flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border shadow-sm bg-gray-100 absolute inset-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        
                        {/* ফলব্যাক ইনিশিয়াল */}
                        <div 
                          className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold items-center justify-center shadow-sm absolute inset-0"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 font-semibold text-blue-600">
                      {member.memberId}
                    </td>
                    
                    <td className="p-4 text-gray-800 font-medium">{member.name}</td>
                    
                    <td className="p-4 text-gray-600">{member.phone}</td>
                    
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          member.status === "Active"
                            ? "bg-green-600"
                            : member.status === "Inactive"
                            ? "bg-gray-500"
                            : "bg-red-600"
                        }`}
                      >
                        {member.status || "Active"}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        {/* View Button (সবাই দেখতে পাবে) */}
                        <Link
                          to={`/member/${targetId}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          View
                        </Link>
                        
                        {/* ID Card Button (সবাই দেখতে পাবে) */}
                        <Link
                          to={`/member-card/${member._id}`}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          ID Card
                        </Link>

                        {/* Edit এবং Delete বাটন শুধুমাত্র Admin / Super Admin দেখতে পাবে */}
                        {isAdmin && (
                          <>
                            <Link
                              to={`/edit-member/${member._id}`}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                            >
                              Edit
                            </Link>
                            
                            <button
                              onClick={() => deleteMember(member._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                  No Members Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Members;