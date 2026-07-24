import React from "react";
import QRCode from "react-qr-code";

function IDCardFront({ member }) {
  if (!member) return null;

  // ==========================================
  // Base URL (라이ভ এবং লোকাল দুইটার জন্যই সুরক্ষিত)
  // ==========================================

  const BASE_URL = "https://skylark-cooperative-system.onrender.com";

  // ==========================================
  // Image URL Builder (সংশোধিত ও শক্তিশালী ক্লিনিং লজিক)
  // ==========================================

  const buildImageUrl = (file, folder = "") => {
    if (!file) return "";

    // যদি অলরেডি সম্পূর্ণ Http লিংক হয়
    if (file.startsWith("http")) {
      return file;
    }

    // ব্যাকস্ল্যাশ বা উইন্ডোজ পাথ ফিক্স এবং অতিরিক্ত স্লাশ দূর করা
    let cleanFile = file.replace(/\\/g, "/");
    
    // যদি অলরে디 /uploads/... থাকে
    if (cleanFile.startsWith("/uploads")) {
      return `${BASE_URL}${cleanFile}`;
    }

    // যদি ফোল্ডারের নাম অলরেডি যুক্ত থাকে
    if (
      cleanFile.startsWith("photos/") ||
      cleanFile.startsWith("signatures/") ||
      cleanFile.startsWith("nid/") ||
      cleanFile.startsWith("nominee/") ||
      cleanFile.startsWith("nominee-nid/")
    ) {
      // যদি শুরুতে স্লাশ না থাকে একটি স্লাশ যুক্ত করা
      const formattedFile = cleanFile.startsWith("/") ? cleanFile : `/${cleanFile}`;
      return `${BASE_URL}/uploads${formattedFile}`;
    }

    // শুধুমাত্র ফাইলের নাম থাকলে ফোল্ডারসহ পাথ তৈরি
    const cleanFileName = cleanFile.split("/").pop();
    return `${BASE_URL}/uploads/${folder}/${cleanFileName}`;
  };

  // ==========================================
  // Images
  // ==========================================

  const photo =
    buildImageUrl(member.photo, "photos") ||
    "https://via.placeholder.com/250";

  const signature = buildImageUrl(
    member.signature,
    "signatures"
  );

  // ==========================================
  // QR
  // ==========================================

  const qrValue = `${window.location.origin}/member/${member._id}`;

  // ==========================================
  // Dates
  // ==========================================

  const joiningDate = member.joiningDate
    ? new Date(member.joiningDate).toLocaleDateString("en-GB")
    : "-";

  const issueDate = new Date().toLocaleDateString("en-GB");

  return (
    <div
      className="
        relative
        w-[340px]
        h-[600px]
        bg-white
        rounded-2xl
        overflow-hidden
        shadow-2xl
        border-2
        border-blue-700
      "
    >
      {/* Header */}

      <div
        className="
          bg-gradient-to-r
          from-blue-900
          via-blue-700
          to-sky-500
          text-white
          text-center
          py-4
        "
      >
        <img
          src="/images/logo.jpeg"
          alt="Logo"
          className="
            w-14
            h-14
            mx-auto
            rounded-full
            bg-white
            p-1
          "
        />

        <h2
          className="
            text-base
            font-bold
            mt-1
          "
        >
          Skylark Cooperative Society
        </h2>

        <p
          className="
            text-[10px]
            tracking-[3px]
          "
        >
          MEMBER ID CARD
        </p>
      </div>

      {/* Photo */}

      <div
        className="
          flex
          justify-center
          mt-4
        "
      >
        <div
          className="
            border-4
            border-blue-700
            rounded-full
            p-1
            shadow
          "
        >
          <img
            src={photo}
            alt={member.name}
            onLoad={() => console.log("Photo Loaded:", photo)}
            onError={(e) => {
              console.log("Photo Error:", photo);
              e.target.src =
                "https://via.placeholder.com/250";
            }}
            className="
              w-28
              h-28
              rounded-full
              object-cover
            "
          />
        </div>
      </div>

      {/* Name */}

      <div
        className="
          text-center
          mt-3
        "
      >
        <h1
          className="
            text-xl
            font-bold
            uppercase
          "
        >
          {member.name}
        </h1>

        <div
          className="
            inline-block
            bg-blue-700
            text-white
            px-6
            py-1
            rounded-full
            text-sm
            mt-2
          "
        >
          {member.memberId}
        </div>
      </div>

      {/* Information */}

      <div
        className="
          px-6
          mt-4
          text-xs
        "
      >
        <Row title="Phone" value={member.phone} />
        <Row title="Blood" value={member.bloodGroup || "-"} />
        <Row title="NID" value={member.nid || "-"} />
        <Row title="Joining" value={joiningDate} />
        <Row title="Issue" value={issueDate} />
        <div
          className="
            flex
            justify-between
            items-center
            py-2
          "
        >
          <span
            className="
              font-semibold
            "
          >
            Status
          </span>

          <span
            className={`
              px-4
              py-1
              rounded-full
              text-white
              text-[11px]
              font-bold
              ${member.status === "Active"
                ? "bg-green-600"
                : "bg-red-600"}
            `}
          >
            {member.status}
          </span>
        </div>
      </div>

      {/* Signature */}

      <div
        className="
          flex
          justify-between
          px-6
          mt-3
        "
      >
        {/* Member Signature */}

        <div className="text-center">
          {signature ? (
            <img
              src={signature}
              alt="Member Signature"
              onError={(e) => {
                e.target.style.display = "none";
              }}
              className="
                h-8
                w-24
                mx-auto
                object-contain
              "
            />
          ) : (
            <div className="h-8"></div>
          )}

          <div
            className="
              border-t
              border-black
              w-24
              mt-1
            "
          ></div>

          <p
            className="
              text-[10px]
              mt-1
            "
          >
            Member Signature
          </p>
        </div>

        {/* Authorized Signature */}

        <div className="text-center">
          <div className="h-8"></div>

          <div
            className="
              border-t
              border-black
              w-24
              mt-1
            "
          ></div>

          <p
            className="
              text-[10px]
              mt-1
            "
          >
            Authorized Signature
          </p>
        </div>
      </div>

      {/* QR Code */}

      <div
        className="
          flex
          justify-center
          mt-3
        "
      >
        <div
          className="
            border
            p-1
            rounded
          "
        >
          <QRCode
            value={qrValue}
            size={65}
          />
        </div>
      </div>

      {/* Valid */}

      <div
        className="
          text-center
          mt-1
        "
      >
        <p
          className="
            text-[10px]
            text-gray-500
          "
        >
          Valid Until
        </p>

        <p
          className="
            text-xs
            font-bold
            text-red-600
          "
        >
          31/12/2030
        </p>
      </div>
      {/* Footer */}

      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          bg-gradient-to-r
          from-blue-900
          via-blue-700
          to-sky-500
          text-white
          text-center
          py-3
        "
      >
        <p
          className="
            font-bold
            text-sm
          "
        >
          Skylark Cooperative Society
        </p>

        <p
          className="
            text-[10px]
          "
        >
          Established 2023
        </p>
      </div>
    </div>
  );
}

// ==========================================
// Row Component
// ==========================================

function Row({ title, value }) {
  return (
    <div
      className="
        flex
        justify-between
        border-b
        py-1
      "
    >
      <span
        className="
          font-semibold
        "
      >
        {title}
      </span>

      <span>
        {value}
      </span>
    </div>
  );
}

export default IDCardFront;