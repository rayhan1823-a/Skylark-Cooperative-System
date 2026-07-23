import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import MainLayout from "../layouts/MainLayout";
import IDCardFront from "../components/IDCardFront";
import IDCardBack from "../components/IDCardBack";

function MemberIDCard() {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/api/members/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Member API Response:", res.data);

        if (res.data.success) {
          console.log("Member Object:", res.data.member);
          console.log("Photo:", res.data.member.photo);

          setMember(res.data.member);
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
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <h2 className="text-2xl font-bold">
            Loading Member Card...
          </h2>
        </div>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <h2 className="text-2xl font-bold text-red-600">
            Member Not Found
          </h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
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
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-bold text-lg shadow"
            >
              🖨 Print PVC ID Card
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MemberIDCard;