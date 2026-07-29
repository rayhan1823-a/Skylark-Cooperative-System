import React, { useState } from "react";
import { FaBullhorn, FaCalendarAlt, FaFilePdf, FaSearch, FaExclamationCircle } from "react-icons/fa";

function Notice() {
  // ডেমো বা স্যাম্পল নোটিশ ডাটা (পরে আপনি চাইলে ব্যাকএন্ড API থেকে ফেচ করতে পারবেন)
  const [notices] = useState([
    {
      id: 1,
      title: "আগামী মাসিক সাধারণ সভা ও বার্ষিক পর্যালোচনা সভা সম্পর্কিত জরুরি বিজ্ঞপ্তি।",
      category: "General Meeting",
      date: "28 July 2026",
      description: "সকল সম্মানিত সদস্যবৃন্দকে জানানো যাচ্ছে যে, আগামী ৫ আগস্ট ২০২৬ আমাদের সমিতির বার্ষিক পর্যালোচনা সভা অনুষ্ঠিত হবে। উক্ত সভায় সকলের উপস্থিতি একান্ত কাম্য। সভায় গত বছরের আর্থিক প্রতিবেদন ও আগামী বছরের বাজেট পেশ করা হবে।",
      priority: "High",
      author: "Super Admin"
    },
    {
      id: 2,
      title: "ডিপোজিট ও ঋণের কিস্তি জমাদানের নতুন নিয়মাবলী কার্যকর।",
      category: "Financial Update",
      date: "25 July 2026",
      description: "আগামী মাস থেকে সকল প্রকার মাসিক সঞ্চয় এবং ঋণের কিস্তি সরাসরি সিস্টেমের মাধ্যমে অথবা অফিশিয়াল ব্যাংক অ্যাকাউন্টে জমা দিয়ে ট্রানজাকশন আইডি (TrxID) আপডেট করার জন্য অনুরোধ করা হলো।",
      priority: "Medium",
      author: "Management Committee"
    },
    {
      id: 3,
      title: "পবিত্র ঈদুল আজহা ও সরকারি ছুদিন উপলক্ষে অফিস বন্ধের বিজ্ঞপ্তি।",
      category: "Office Notice",
      date: "10 June 2026",
      description: "আসন্ন পবিত্র ঈদুল আজহা উপলক্ষে আগামী ১৭ জুন থেকে ২১ জুন পর্যন্ত সমিতির সকল কার্যক্রম ও অফিশিয়াল লেনদেন বন্ধ থাকবে। ২২ জুন থেকে যথারীতি অফিস খোলা থাকবে।",
      priority: "Normal",
      author: "Office Secretary"
    },
    {
      id: 4,
      title: "নতুন সদস্যদের আইডি কার্ড ও পাসবুক সংগ্রহ করার জন্য আহ্বান।",
      category: "Member Notification",
      date: "02 May 2026",
      description: "যেসকল নতুন সদস্য সম্প্রতি Skylark Cooperative Society-তে যুক্ত হয়েছেন, তারা অফিস সময় চলাকালীন কাউন্টার থেকে তাদের ডিজিটাল আইডি কার্ড ও পাসবুক সংগ্রহ করে নিতে পারেন।",
      priority: "Normal",
      author: "Admin Team"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ফিল্টার করার লজিক
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-10">
      
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-md">
            Notice Board
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2">
            সমিতির সকল নোটিশ ও ঘোষণা
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            সমিতির সাম্প্রতিক সকল গুরুত্বপূর্ণ আপডেট, মিটিং ও নীতিমালা এখানে প্রকাশিত হয়।
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-72 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="নোটিশ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/25 transition"
          />
        </div>
      </div>

      {/* ==========================================
          CATEGORY FILTER TABS
      ========================================== */}
      <div className="flex flex-wrap gap-2 items-center">
        {["All", "General Meeting", "Financial Update", "Office Notice", "Member Notification"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat === "All" ? "সকল নোটিশ" : cat}
          </button>
        ))}
      </div>

      {/* ==========================================
          NOTICE LIST SECTION
      ========================================== */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div 
              key={notice.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-md">
                    {notice.category}
                  </span>
                  
                  {notice.priority === "High" && (
                    <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <FaExclamationCircle /> High Priority
                    </span>
                  )}

                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                    <FaCalendarAlt size={12} /> {notice.date}
                  </span>
                </div>

                <h3 className="text-base lg:text-lg font-bold text-slate-800 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {notice.description}
                </p>

                <div className="text-xs text-slate-400 pt-1">
                  প্রকাশক: <span className="font-semibold text-slate-700">{notice.author}</span>
                </div>
              </div>

              {/* Action Button (Optional Download/View) */}
              <div className="w-full md:w-auto flex md:flex-col justify-end">
                <button 
                  onClick={() => alert(`নোটিশ আইডি: ${notice.id} - বিস্তারিত পঠিত হয়েছে।`)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  <FaFilePdf /> বিস্তারিত পড়ুন
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-slate-300 text-4xl mb-3 flex justify-center">
              <FaBullhorn />
            </div>
            <h3 className="text-slate-700 font-bold text-base">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-slate-400 text-xs mt-1">আপনার সার্চ বা ক্যাটাগরি পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Notice;