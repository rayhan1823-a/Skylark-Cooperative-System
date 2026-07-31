import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API_URL = "https://skylark-cooperative-system.onrender.com";

function ExitedMembers() {
  const navigate = useNavigate();
  const [exitedMembers, setExitedMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const r = storedUser.role || localStorage.getItem("role") || "MEMBER";
      if (
        r === "SUPER_ADMIN" || 
        storedUser.isSuperAdmin === true || 
        localStorage.getItem("isSuperAdmin") === "true"
      ) {
        setIsSuperAdmin(true);
      }
    } catch (e) {
      console.error(e);
    }

    fetchExitedMembers();
  }, []);

  const fetchExitedMembers = async () => {
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
        // শুধুমাত্র এক্সিট নেওয়া মেম্বারদের ফিল্টার করা (যাদের status "Exited", "Closed" বা অনুরূপ)
        const allMembers = res.data.members || [];
        const filtered = allMembers.filter(
          m => m.status && ["Exited", "Closed", "Terminated", "Inactive"].includes(m.status)
        );
        setExitedMembers(filtered);
      } else {
        setExitedMembers([]);
      }
    } catch (error) {
      console.error("Error fetching exited members:", error);
      toast.error(error.response?.data?.message || "Failed to load exited members");
      setExitedMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = exitedMembers.filter((member) => {
    const text = search.toLowerCase();
    return (
      member.memberId?.toLowerCase().includes(text) ||
      member.name?.toLowerCase().includes(text) ||
      member.phone?.includes(text)
    );
  });

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exited Members Management</h1>
          <p className="text-sm text-gray-500 mt-1">List of members who have settled accounts and left the society.</p>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Member ID, Name or Phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
      />

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-600 text-white">
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
                  Loading Exited Members...
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
                          />
                        ) : null}
                        <div 
                          className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 font-bold items-center justify-center shadow-sm absolute inset-0"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 font-semibold text-rose-600">
                      {member.memberId}
                    </td>
                    
                    <td className="p-4 text-gray-800 font-medium">{member.name}</td>
                    
                    <td className="p-4 text-gray-600">{member.phone}</td>
                    
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-rose-600">
                        {member.status || "Exited"}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/member/${member._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          View Ledger / History
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                  No Exited Members Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExitedMembers;