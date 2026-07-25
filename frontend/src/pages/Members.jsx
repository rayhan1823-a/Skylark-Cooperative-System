import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";

const API_URL = "https://skylark-cooperative-system.onrender.com";

function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ইউজারের রোল এবং পরিচয় ট্র্যাক করার স্টেট
  const [userRole, setUserRole] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserMemberId, setCurrentUserMemberId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে লগইন করা ইউজারের তথ্য নিরাপদে বের করা
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const r = storedUser.role || localStorage.getItem("role") || "MEMBER";
      setUserRole(r);
      setUserPhone(storedUser.phone || storedUser.phoneNumber || localStorage.getItem("phone") || "");
      setCurrentUserId(storedUser.id || storedUser._id || localStorage.getItem("userId") || "");
      setCurrentUserMemberId(storedUser.memberId || localStorage.getItem("memberId") || "");

      // Super Admin চেক
      if (
        r === "SUPER_ADMIN" || 
        storedUser.isSuperAdmin === true || 
        localStorage.getItem("isSuperAdmin") === "true"
      ) {
        setIsSuperAdmin(true);
      }
    } catch (e) {
      setUserRole("MEMBER");
    }

    fetchMembers();
  }, []);

  // ==========================
  // Fetch Members
  // ==========================
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

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
  // Delete Member (Secured for Super Admin)
  // ==========================
  const deleteMember = async (id) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can delete members.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this member?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");

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
  // Protected Add Click Handler
  // ==========================
  const handleAddClick = (e) => {
    if (!isSuperAdmin) {
      e.preventDefault();
      toast.error("Access Denied: Only Super Admin can add members.");
    }
  };

  // ==========================
  // Protected Edit Click Handler
  // ==========================
  const handleEditClick = (e, memberId) => {
    if (!isSuperAdmin) {
      e.preventDefault();
      toast.error("Access Denied: Only Super Admin can edit members.");
      return;
    }
    navigate(`/edit-member/${memberId}`);
  };

  // ==========================
  // Role & Search Filtering Logic
  // ==========================
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const filteredMembers = members.filter((member) => {
    if (!isAdmin) {
      const cleanMemberPhone = (member.phone || "").trim();
      const cleanUserPhone = (userPhone || "").trim();
      
      const cleanMemberId = String(member._id || "").trim();
      const cleanUserId = String(currentUserId || "").trim();
      const cleanMemberCustomId = String(member.memberId || "").trim();
      const cleanUserMemberId = String(currentUserMemberId || "").trim();

      const isPhoneMatch = cleanUserPhone && cleanMemberPhone === cleanUserPhone;
      const isIdMatch = (cleanUserId && cleanMemberId === cleanUserId) || (cleanUserMemberId && cleanMemberCustomId === cleanUserMemberId);

      if (!isPhoneMatch && !isIdMatch) {
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
        
        {/* Add Member বাটন (সুপার অ্যাডমিন না হলে ক্লিক করলে টাস্ট মেসেজ ও বাধা দেবে) */}
        <Link
          to="/add-member"
          onClick={handleAddClick}
          className={`px-5 py-2 rounded-lg text-center shadow transition-colors text-white ${
            isSuperAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 hover:bg-gray-500"
          }`}
          title={!isSuperAdmin ? "Only Super Admin can add members" : ""}
        >
          + Add Member
        </Link>
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
                let imageUrl = "";
                if (member.photo) {
                  if (member.photo.startsWith("http")) {
                    imageUrl = member.photo;
                  } else {
                    const cleanFileName = member.photo.replace(/\\/g, '/').split('/').pop();
                    imageUrl = `${API_URL}/uploads/photos/${cleanFileName}`;
                  }
                }

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
                        {/* View Button */}
                        <Link
                          to={`/member/${member._id}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          View
                        </Link>
                        
                        {/* ID Card Button */}
                        <Link
                          to={`/member-card/${member._id}`}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          ID Card
                        </Link>

                        {/* Edit Button (নন-সুপার অ্যাডমিন ক্লিক করলে টাস্ট মেসেজ দিয়ে বাধা দেবে) */}
                        <button
                          onClick={(e) => handleEditClick(e, member._id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition text-white ${
                            isSuperAdmin ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer" : "bg-gray-400 hover:bg-gray-500 cursor-pointer"
                          }`}
                          title={!isSuperAdmin ? "Only Super Admin can edit members" : ""}
                        >
                          Edit
                        </button>
                        
                        {/* Delete Button (নন-সুপার অ্যাডমিন ক্লিক করলে টাস্ট মেসেজ দিয়ে বাধা দেবে) */}
                        <button
                          onClick={() => deleteMember(member._id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition text-white ${
                            isSuperAdmin ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-gray-400 hover:bg-gray-500 cursor-pointer"
                          }`}
                          title={!isSuperAdmin ? "Only Super Admin can delete members" : ""}
                        >
                          Delete
                        </button>
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