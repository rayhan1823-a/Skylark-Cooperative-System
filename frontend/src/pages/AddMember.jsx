import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function AddMember() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে লগইন করা ইউজারের রোল চেক করা
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const r = storedUser.role || localStorage.getItem("role") || "MEMBER";

      if (
        r === "SUPER_ADMIN" || 
        storedUser.isSuperAdmin === true || 
        localStorage.getItem("isSuperAdmin") === "true"
      ) {
        setIsSuperAdmin(true);
      } else {
        toast.error("Access Denied: Only Super Admin can access this page.");
        navigate("/members");
      }
    } catch (e) {
      setIsSuperAdmin(false);
      navigate("/members");
    }
  }, [navigate]);

  // ======================================
  // Initial Form State
  // ======================================

  const initialState = {
    memberId: "",
    userId: "",
    email: "",
    password: "",
    name: "",
    fatherName: "",
    motherName: "",
    phone: "",
    emergencyContact: "",
    bloodGroup: "",
    nid: "",
    dateOfBirth: "",
    joiningDate: "",
    presentAddress: "",
    permanentAddress: "",
    nomineeName: "",
    nomineeRelation: "",
    status: "Active",
  };

  const [formData, setFormData] =
    useState(initialState);

  // ======================================
  // Files
  // ======================================

  const [photo, setPhoto] = useState(null);
  const [nidFile, setNidFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [nomineePhoto, setNomineePhoto] = useState(null);
  const [nomineeNid, setNomineeNid] = useState(null);

  // ======================================
  // Handle Input
  // ======================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ======================================
  // Reset Form
  // ======================================

  const resetForm = () => {
    setFormData(initialState);
    setPhoto(null);
    setNidFile(null);
    setSignature(null);
    setNomineePhoto(null);
    setNomineeNid(null);
  };

  // ======================================
  // Save Member
  // ======================================

  const saveMember = async () => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Only Super Admin can add members.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (photo) data.append("photo", photo);
      if (nidFile) data.append("nidFile", nidFile);
      if (signature) data.append("signature", signature);
      if (nomineePhoto) data.append("nomineePhoto", nomineePhoto);
      if (nomineeNid) data.append("nomineeNid", nomineeNid);

      await axios.post(
        "https://skylark-cooperative-system.onrender.com/api/members",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Member Added Successfully");

      resetForm();

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to Add Member"
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Add New Member
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* =========================== */}
          {/* Member ID */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Member ID
            </label>
            <input
              type="text"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              placeholder="SKY-0001"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* User ID */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              User ID / Login ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter User ID (Optional)"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Email */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email (Optional)"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Password */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password (Optional)"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Full Name */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Full Name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Father Name */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Father Name
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Father Name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Mother Name */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Mother Name
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Mother Name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Mobile Number */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Mobile Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Emergency Contact */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Emergency Contact
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency Contact"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Blood Group */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* =========================== */}
          {/* NID */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              NID Number
            </label>
            <input
              type="text"
              name="nid"
              value={formData.nid}
              onChange={handleChange}
              placeholder="National ID Number"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Date of Birth */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Joining Date */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Status */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* =========================== */}
          {/* Present Address */}
          {/* =========================== */}

          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">
              Present Address
            </label>
            <textarea
              rows="3"
              name="presentAddress"
              value={formData.presentAddress}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Permanent Address */}
          {/* =========================== */}

          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">
              Permanent Address
            </label>
            <textarea
              rows="3"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Member Photo */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              📷 Member Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />

            {photo && (
              <img
                src={URL.createObjectURL(photo)}
                alt="Member"
                className="mt-3 w-32 h-32 rounded-lg border object-cover"
              />
            )}
          </div>

          {/* =========================== */}
          {/* Member NID Copy */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              🪪 Member NID Copy
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setNidFile(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />

            {nidFile && (
              <p className="mt-2 text-green-600 text-sm">
                {nidFile.name}
              </p>
            )}
          </div>

          {/* =========================== */}
          {/* Member Signature */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              ✍ Member Signature
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignature(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />

            {signature && (
              <img
                src={URL.createObjectURL(signature)}
                alt="Signature"
                className="mt-3 h-20 border rounded bg-white object-contain p-2"
              />
            )}
          </div>

          {/* =========================== */}
          {/* Nominee Name */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Nominee Name
            </label>
            <input
              type="text"
              name="nomineeName"
              value={formData.nomineeName}
              onChange={handleChange}
              placeholder="Enter Nominee Name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Nominee Relation */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Relationship with Member
            </label>
            <input
              type="text"
              name="nomineeRelation"
              value={formData.nomineeRelation}
              onChange={handleChange}
              placeholder="Father / Mother / Wife / Husband / Son / Daughter"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* =========================== */}
          {/* Nominee Photo */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              📷 Nominee Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNomineePhoto(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />

            {nomineePhoto && (
              <img
                src={URL.createObjectURL(nomineePhoto)}
                alt="Nominee"
                className="mt-3 w-32 h-32 rounded-lg border object-cover"
              />
            )}
          </div>

          {/* =========================== */}
          {/* Nominee NID Copy */}
          {/* =========================== */}

          <div>
            <label className="block mb-2 font-semibold">
              🪪 Nominee NID Copy
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setNomineeNid(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />

            {nomineeNid && (
              <p className="mt-2 text-green-600 text-sm">
                {nomineeNid.name}
              </p>
            )}
          </div>

        </div>

        {/* =========================== */}
        {/* Buttons */}
        {/* =========================== */}

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={saveMember}
            disabled={loading || !isSuperAdmin}
            className={`px-8 py-3 rounded-lg font-semibold transition text-white ${
              isSuperAdmin 
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400" 
                : "bg-gray-400 cursor-not-allowed"
            }`}
            title={!isSuperAdmin ? "Only Super Admin can add members" : ""}
          >
            {loading ? "Saving Member..." : "💾 Save Member"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            🔄 Reset
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddMember;