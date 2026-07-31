import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({
    photo: null,
    nidFile: null,
    signature: null,
    nomineePhoto: null,
    nomineeNid: null
  });

  const loadMember = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const res = await axios.get(
        `https://skylark-cooperative-system.onrender.com/api/members/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const memberData = res.data.member || res.data.data || res.data;
      setFormData(memberData || {});
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles({
      ...selectedFiles,
      [e.target.name]: e.target.files[0]
    });
  };

  const updateMember = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const data = new FormData();
      
      // ফিক্সড: টাইপ অবজেক্ট চেক সরিয়ে সাধারণ ভ্যালিডেশন দেওয়া হয়েছে যাতে আইডি বা টেক্সট ফিল্ডগুলো মিসিং না হয়
      Object.keys(formData).forEach((key) => {
        if (
          key !== '_id' && 
          key !== '__v' && 
          formData[key] !== null && 
          formData[key] !== undefined
        ) {
          data.append(key, formData[key]);
        }
      });

      if (selectedFiles.photo) data.append("photo", selectedFiles.photo);
      if (selectedFiles.nidFile) data.append("nidFile", selectedFiles.nidFile);
      if (selectedFiles.signature) data.append("signature", selectedFiles.signature);
      if (selectedFiles.nomineePhoto) data.append("nomineePhoto", selectedFiles.nomineePhoto);
      if (selectedFiles.nomineeNid) data.append("nomineeNid", selectedFiles.nomineeNid);

      await axios.put(
        `https://skylark-cooperative-system.onrender.com/api/members/${id}`,
        data,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      alert("✅ Member Updated Successfully");
      navigate("/members");
    } catch (error) {
      console.log(error);
      alert("❌ Update Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10 text-center text-xl bg-slate-50 min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Edit Member</h1>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Member ID" name="memberId" value={formData.memberId} change={handleChange} />
            <Field label="Full Name" name="name" value={formData.name} change={handleChange} />
            <Field label="Father Name" name="fatherName" value={formData.fatherName} change={handleChange} />
            <Field label="Mother Name" name="motherName" value={formData.motherName} change={handleChange} />
            <Field label="Phone Number" name="phone" value={formData.phone} change={handleChange} />
            <Field label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} change={handleChange} />
            <Field label="Blood Group" name="bloodGroup" value={formData.bloodGroup} change={handleChange} />
            <Field label="NID Number" name="nid" value={formData.nid} change={handleChange} />
            <DateField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} change={handleChange} />
            <DateField label="Joining Date" name="joiningDate" value={formData.joiningDate} change={handleChange} />

            <div>
              <label className="font-semibold block mb-1">Status</label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                {/* ✅ এক্সিট মেম্বার ম্যানেজমেন্টের জন্য এই অপশনটি যোগ করা হয়েছে */}
                <option value="Exited">Exited</option>
              </select>
            </div>

            <Field label="Nominee Name" name="nomineeName" value={formData.nomineeName} change={handleChange} />
            <Field label="Nominee Relation" name="nomineeRelation" value={formData.nomineeRelation} change={handleChange} />

            <FileField label="Member Photo" name="photo" currentFile={formData.photo} change={handleFileChange} />
            <FileField label="NID File" name="nidFile" currentFile={formData.nidFile} change={handleFileChange} />
            <FileField label="Signature" name="signature" currentFile={formData.signature} change={handleFileChange} />
            <FileField label="Nominee Photo" name="nomineePhoto" currentFile={formData.nomineePhoto} change={handleFileChange} />
            <FileField label="Nominee NID File" name="nomineeNid" currentFile={formData.nomineeNid} change={handleFileChange} />
          </div>

          <div className="mt-5">
            <label className="font-semibold block mb-1">Present Address</label>
            <textarea
              name="presentAddress"
              value={formData.presentAddress || ""}
              onChange={handleChange}
              rows="3"
              className="border p-3 rounded-lg w-full"
            ></textarea>
          </div>

          <div className="mt-5">
            <label className="font-semibold block mb-1">Permanent Address</label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress || ""}
              onChange={handleChange}
              rows="3"
              className="border p-3 rounded-lg w-full"
            ></textarea>
          </div>

          <button
            onClick={updateMember}
            className="mt-6 bg-green-600 text-white px-10 py-3 rounded-lg hover:bg-green-700 font-bold transition shadow-md"
          >
            Update Member
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, change }) {
  return (
    <div>
      <label className="font-semibold block mb-1">{label}</label>
      <input name={name} value={value || ""} onChange={change} className="border p-3 rounded-lg w-full" />
    </div>
  );
}

function DateField({ label, name, value, change }) {
  return (
    <div>
      <label className="font-semibold block mb-1">{label}</label>
      <input
        type="date"
        name={name}
        value={value ? value.substring(0, 10) : ""}
        onChange={change}
        className="border p-3 rounded-lg w-full"
      />
    </div>
  );
}

function FileField({ label, name, currentFile, change }) {
  return (
    <div>
      <label className="font-semibold block mb-1">{label}</label>
      {currentFile && (
        <div className="mb-2 text-sm">
          <a href={currentFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 font-medium">
            View Current File
          </a>
        </div>
      )}
      <input type="file" name={name} onChange={change} className="border p-2 rounded-lg w-full text-sm bg-gray-50" />
    </div>
  );
}

export default EditMember;