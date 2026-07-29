import React, { useState, useEffect } from "react";
import { FaBullhorn, FaUniversity, FaShieldAlt, FaCalendarAlt, FaMobileAlt, FaCopy, FaCheck, FaGem, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Home() {
  // উন্নত ও প্রফেশনাল ব্যানার ডেটা (ব্যাজ বা অপ্রয়োজনীয় লেখা বাদ দেওয়া হয়েছে)
  const banners = [
    {
      title: "Skylark Cooperative Society",
      subtitle: "Empowering Members Through Secure, Transparent & Smart Financial Management.",
      description: "সমিতির প্রতিটি সদস্যের জন্য আধুনিক, নিরাপদ ও নির্ভরযোগ্য ডিজিটাল আর্থিক সেবা।",
      bg: "from-slate-950 via-indigo-950 to-blue-950",
      borderGlow: "border-blue-500/30 shadow-blue-500/10"
    },
    {
      title: "Complete Digital Cooperative Solution",
      subtitle: "Manage Deposits, Loans, Withdrawals, Penalties, Reports & Member Information in One Secure Platform.",
      description: "একটি প্ল্যাটফর্মেই সমিতির সকল কার্যক্রম পরিচালনার আধুনিক সমাধান।",
      bg: "from-slate-950 via-purple-950 to-slate-900",
      borderGlow: "border-purple-500/30 shadow-purple-500/10"
    },
    {
      title: "Professional Financial Management",
      subtitle: "Ensuring Transparency, Accountability and Sustainable Growth for Every Member.",
      description: "প্রতিটি সদস্যের আর্থিক নিরাপত্তা ও সমিতির দীর্ঘমেয়াদি উন্নয়নের জন্য নিবেদিত।",
      bg: "from-slate-950 via-blue-950 to-slate-900",
      borderGlow: "border-emerald-500/30 shadow-emerald-500/10"
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* ==========================================
          1. PROFESSIONAL PREMIUM BANNER SECTION
      ========================================== */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr ${banners[currentSlide].bg} text-white transition-all duration-700 p-8 lg:p-16 border ${banners[currentSlide].borderGlow} backdrop-blur-xl group`}>
        
        {/* Modern Background Lighting Effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Subtle Tech Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none"></div>

        {/* Left & Right Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-blue-600 hover:text-white text-blue-300 p-3 rounded-full border border-blue-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 shadow-lg backdrop-blur-md"
          title="Previous Slide"
        >
          <FaChevronLeft size={16} />
        </button>

        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-blue-600 hover:text-white text-blue-300 p-3 rounded-full border border-blue-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 shadow-lg backdrop-blur-md"
          title="Next Slide"
        >
          <FaChevronRight size={16} />
        </button>

        {/* Centered Content Wrapper */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
          
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent drop-shadow-md">
            {banners[currentSlide].title}
          </h1>

          <p className="text-slate-300 text-sm lg:text-base font-normal leading-relaxed max-w-2xl">
            {banners[currentSlide].subtitle}
          </p>

          <div className="pt-2 inline-flex items-center gap-2 text-blue-300 text-xs lg:text-sm font-semibold bg-blue-500/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 backdrop-blur-sm shadow-sm">
            <span>✨</span> 
            <span className="text-blue-100">{banners[currentSlide].description}</span>
          </div>

        </div>

        {/* Slider Dots & Indicators */}
        <div className="flex items-center justify-between mt-12 relative z-10 pt-4 border-t border-blue-500/20 max-w-5xl mx-auto">
          <div className="flex gap-2 mx-auto sm:mx-0">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentSlide === index ? "w-10 bg-gradient-to-r from-blue-400 to-indigo-400 shadow-md shadow-blue-400/50" : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400/80 font-mono tracking-wider">
            <FaGem /> PREMIER EDITION 2026
          </div>
        </div>

      </div>

      {/* ==========================================
          2. UPDATE MESSAGE / ANNOUNCEMENT
      ========================================== */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl shadow-sm flex items-start gap-4">
        <div className="text-amber-600 text-2xl mt-0.5">
          <FaBullhorn />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-base">জরুরি আপডেট ও নির্দেশনা</h3>
          <p className="text-amber-800 text-sm mt-1">
            সকল সদস্যবৃন্দকে জানানো যাচ্ছে যে, চলতি মাসের মাসিক জমা ও কিস্তি নির্দিষ্ট সময়ের মধ্যে পরিশোধ করার জন্য অনুরোধ করা হলো। যেকোনো প্রয়োজনে সমিতির ড্যাশবোর্ড বা অফিস কর্তৃপক্ষের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* ==========================================
          3. PREMIUM BANK & MFS INFORMATION SECTION
      ========================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaUniversity className="text-blue-600" /> সমিতির অফিশিয়াল ব্যাংক ও পেমেন্ট অ্যাকাউন্টস
          </h2>
          <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
            💡 অ্যাকাউন্টে ক্লিক করে নম্বর কপি করতে পারেন
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Premium Bank Card (IFIC Bank) */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-6 rounded-3xl shadow-xl border border-blue-100/80 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white p-3.5 rounded-2xl shadow-md shadow-blue-500/20">
                <FaUniversity size={22} />
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                ● Active Bank
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 text-xl tracking-tight">IFIC Bank PLC</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Branch: Darus Salam Road, Mirpur</p>
            
            <div className="mt-5 pt-4 border-t border-slate-200/60 space-y-3">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Name</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                  MD Hasan Al Mamun, MD Mahidul Mollla, MD Ahsanul Islam
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Account Number</p>
                  <span className="text-blue-700 font-mono font-extrabold text-sm tracking-wider">0200044702812</span>
                </div>
                <button
                  onClick={() => handleCopy("0200044702812")}
                  className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 p-2 rounded-xl transition text-xs flex items-center gap-1 font-semibold"
                  title="Copy A/C No"
                >
                  {copiedText === "0200044702812" ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>

          {/* Premium MFS Card (bKash, Nagad, Rocket) */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-pink-50/40 p-6 rounded-3xl shadow-xl border border-pink-100/80 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-tr from-pink-600 to-rose-700 text-white p-3.5 rounded-2xl shadow-md shadow-pink-500/20">
                <FaMobileAlt size={22} />
              </div>
              <span className="text-xs font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full border border-pink-200">
                ● Personal Wallets
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 text-xl tracking-tight">bKash / Nagad / Rocket</h4>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Official Personal Numbers</p>
            
            <div className="mt-5 pt-4 border-t border-slate-200/60 space-y-2.5 text-xs">
              
              {/* bKash */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <span className="font-bold text-slate-500 text-[11px]">bKash:</span>
                  <span className="text-pink-600 font-mono font-bold ml-2">01314533222</span>
                </div>
                <button onClick={() => handleCopy("01314533222")} className="text-slate-400 hover:text-pink-600 p-1">
                  {copiedText === "01314533222" ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
                </button>
              </div>

              {/* Nagad */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <span className="font-bold text-slate-500 text-[11px]">Nagad:</span>
                  <span className="text-orange-600 font-mono font-bold ml-2">01400444424</span>
                </div>
                <button onClick={() => handleCopy("01400444424")} className="text-slate-400 hover:text-orange-600 p-1">
                  {copiedText === "01400444424" ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
                </button>
              </div>

              {/* Rocket */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <span className="font-bold text-slate-500 text-[11px]">Rocket:</span>
                  <span className="text-purple-600 font-mono font-bold ml-2">01400444424</span>
                </div>
                <button onClick={() => handleCopy("01400444424")} className="text-slate-400 hover:text-purple-600 p-1">
                  {copiedText === "01400444424" ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
                </button>
              </div>

            </div>
          </div>

          {/* Premium Security & Instruction Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3 bg-emerald-950/50 w-fit px-3 py-1 rounded-full border border-emerald-800/50 text-xs">
                <FaShieldAlt /> নিরাপদ লেনদেন নির্দেশিকা
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                যেকোনো ব্যাংকিং বা মোবাইল ওয়ালেটে টাকা প্রেরণের পর অবশ্যই সঠিক ট্রানজাকশন আইডি (<span className="text-blue-300 font-mono font-bold">TrxID</span>) এবং রসিদ সংরক্ষণ করুন। পরবর্তীতে পেমেন্ট সেকশনে এটি সাবমিট করুন।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>সিস্টেম সিকিউরিটি</span>
              <span className="text-blue-400 font-semibold">Skylark Management</span>
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          4. RECENT NOTICES PREVIEW
      ========================================== */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FaBullhorn className="text-indigo-600" /> সাম্প্রতিক নোটিশসমূহ
          </h3>
          <a href="/notice" className="text-xs font-bold text-blue-600 hover:underline">সব দেখুন →</a>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">General Notice</span>
              <h4 className="font-semibold text-slate-800 text-sm mt-1">আগামী মাসিক সাধারণ সভা সম্পর্কিত জরুরি বিজ্ঞপ্তি।</h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FaCalendarAlt size={12} /> 28 July 2026
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">Financial Update</span>
              <h4 className="font-semibold text-slate-800 text-sm mt-1">লুান ও ডিপোজিট সংক্রান্ত নতুন নীতিমালা কার্যকর।</h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FaCalendarAlt size={12} /> 25 July 2026
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;