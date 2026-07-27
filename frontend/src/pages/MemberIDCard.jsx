import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import IDCardFront from "../components/IDCardFront";
import IDCardBack from "../components/IDCardBack";

function MemberIDCard() {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");

        // ✅ ফিক্সড: যদি ইউআরএলে id না থাকে বা রেন্ডারের সময় প্রবলেম হয়, তবে টোকেন বেসড প্রোফাইল রাউট কল হবে
        const endpoint = id 
          ? `https://skylark-cooperative-system.onrender.com/api/members/${id}`
          : `https://skylark-cooperative-system.onrender.com/api/members/profile`;

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Member API Response:", res.data);

        if (res.data.success || res.data._id || res.data.member) {
          const memberData = res.data.member || res.data.data || res.data;
          console.log("Member Object:", memberData);
          console.log("Photo:", memberData.photo);

          setMember(memberData);
        } else {
          setMember(null);
        }
      } catch (error) {
        console.error("Member Card Error:", error);
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-10 text-center text-2xl font-bold text-blue-600 bg-slate-50 min-h-screen flex items-center justify-center">
        Loading Member Card...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex-1 p-10 text-center text-red-600 text-xl font-bold bg-slate-50 min-h-screen flex items-center justify-center">
        Member Not Found
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto w-full bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-2">
          Skylark Cooperative Society
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Digital PVC Member ID Card
        </p>

        <div
          id="printArea"
          className="flex justify-center items-start gap-10 flex-wrap"
        >
          <div className="card-print">
            <IDCardFront member={member} />
          </div>

          <div className="card-print">
            <IDCardBack member={member} />
          </div>
        </div>

        <div className="text-center mt-10 no-print">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-bold text-lg shadow transition"
          >
            🖨 Print PVC ID Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberIDCard;