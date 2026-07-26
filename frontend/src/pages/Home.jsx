import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // আপনার প্রজেক্টের সাইডবার পাথ ঠিক করে নেবেন
import { FaBullhorn, FaImages, FaInfoCircle, FaShieldAlt } from "react-icons/fa";

function Home() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  // ব্যানার স্লাইডারের জন্য ইমেজ লিস্ট (আপনি চাইলে এগুলো পরিবর্তন বা ব্যাকএন্ড থেকে আনতে পারবেন)
  const banners = [
    {
      id: 1,
      title: "Skylark Cooperative Society",
      subtitle: "Digital Cooperative Management System",
      bg: "from-blue-900 via-indigo-900 to-slate-900",
    },
    {
      id: 2,
      title: "Secure & Transparent Financial Core",
      subtitle: "Manage your savings, deposits, and loans easily.",
      bg: "from-slate-900 via-blue-950 to-indigo-950",
    },
    {
      id: 3,
      title: "Empowering Members Together",
      subtitle: "Building a stronger financial future for everyone.",
      bg: "from-indigo-950 via-slate-900 to-blue-900",
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  // অটো-চেঞ্জিং ব্যানার ইফেক্ট (৪ সেকেন্ড পর পর স্লাইড বদলাবে)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl mb-8 gap-4">
          <div>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Welcome Home
            </span>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
              समिति হোম পেজ (Somiti Home)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              স্বাগতম, <span className="text-blue-400 font-semibold">{user.name || "User"}</span>! সমিতির মূল তথ্যাবলী ও আপডেট এখানে দেখতে পাবেন।
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl text-right">
            <p className="text-xs text-slate-400">Current Role</p>
            <p className="text-sm font-bold text-indigo-400">{user.role}</p>
          </div>
        </div>

        {/* Auto-Changing Banner / Slider Section */}
        <div className="relative w-full h-72 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 mb-10">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 bg-gradient-to-r ${banner.bg} flex flex-col justify-center items-center text-center p-8 transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="max-w-2xl">
                <span className="bg-white/10 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 backdrop-blur-md">
                  Official Notice & Highlights
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight drop-shadow-md">
                  {banner.title}
                </h2>
                <p className="text-slate-300 text-sm sm:text-lg mt-3 font-medium">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Slider Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentBanner ? "w-8 bg-blue-500" : "w-2.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-xl mb-4 border border-blue-500/20">
              <FaBullhorn />
            </div>
            <h3 className="text-lg font-bold text-white">সমিতির ঘোষণা</h3>
            <p className="text-slate-400 text-sm mt-2">
              সকল সদস্যের অবগতির জন্য জানানো যাচ্ছে যে, মাসিক জমা এবং কিস্তি নিয়মিত পরিশোধ করুন।
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-xl mb-4 border border-indigo-500/20">
              <FaImages />
            </div>
            <h3 className="text-lg font-bold text-white">গ্যালারি ও কার্যক্রম</h3>
            <p className="text-slate-400 text-sm mt-2">
              আমাদের বিভিন্ন সভা, ইভেন্ট এবং প্রকল্পের ছবি ও ভিডিও দেখতে গ্যালারি ভিজিট করুন।
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center text-xl mb-4 border border-emerald-500/20">
              <FaShieldAlt />
            </div>
            <h3 className="text-lg font-bold text-white">সিস্টেম সিকিউরিটি</h3>
            <p className="text-slate-400 text-sm mt-2">
              {isSuperAdmin ? "আপনি সুপার এডমিন হিসেবে সম্পূর্ণ পেজ বা কন্টেন্ট কন্ট্রোল করতে পারবেন।" : "আপনি একজন অনুমোদিত ব্যবহারকারী হিসেবে পেজটি দেখতে পারছেন।" }
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;