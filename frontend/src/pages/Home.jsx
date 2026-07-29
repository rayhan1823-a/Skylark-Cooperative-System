import React, { useState, useEffect } from "react";
import { FaBullhorn, FaUniversity, FaShieldAlt, FaCalendarAlt, FaMobileAlt } from "react-icons/fa";

function Home() {
  // প্রফেশনাল ৩টি ব্যানার ডেটা
  const banners = [
    {
      title: "Skylark Cooperative Society",
      subtitle:
        "Empowering Members Through Secure, Transparent & Smart Financial Management.",
      description:
        "সমিতির প্রতিটি সদস্যের জন্য আধুনিক, নিরাপদ ও নির্ভরযোগ্য ডিজিটাল আর্থিক সেবা।",
      badge: "🏆 Trusted Cooperative",
      bg: "from-blue-950 via-indigo-900 to-sky-700",
    },
    {
      title: "Complete Digital Cooperative Solution",
      subtitle:
        "Manage Deposits, Loans, Withdrawals, Penalties, Reports & Member Information in One Secure Platform.",
      description:
        "একটি প্ল্যাটফর্মেই সমিতির সকল কার্যক্রম পরিচালনার আধুনিক সমাধান।",
      badge: "⚡ Smart Management",
      bg: "from-emerald-900 via-green-800 to-teal-700",
    },
    {
      title: "Professional Financial Management",
      subtitle:
        "Ensuring Transparency, Accountability and Sustainable Growth for Every Member.",
      description:
        "প্রতিটি সদস্যের আর্থিক নিরাপত্তা ও সমিতির দীর্ঘমেয়াদি উন্নয়নের জন্য নিবেদিত।",
      badge: "🔐 Secure & Reliable",
      bg: "from-purple-900 via-violet-800 to-fuchsia-700",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // স্লাইডার অটো চেঞ্জ হওয়ার ইফেক্ট (৫ সেকেন্ড বা ৫০০০ মিলিসেকেন্ড পর পর)
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* ==========================================
          1. SLIDER BANNER SECTION
      ========================================== */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r ${banners[currentSlide].bg} text-white transition-all duration-700 p-8 lg:p-12`}>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="inline-block bg-white/20 text-white text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
            {banners[currentSlide].badge}
          </span>
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight leading-tight">
            {banners[currentSlide].title}
          </h1>
          <p className="text-slate-200 text-sm lg:text-base font-medium">
            {banners[currentSlide].subtitle}
          </p>
          <p className="text-amber-300 text-xs lg:text-sm font-semibold pt-1">
            ✨ {banners[currentSlide].description}
          </p>
        </div>

        {/* Slider Dots */}
        <div className="flex gap-2 mt-6 relative z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/40"
              }`}
            />
          ))}
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
            সকল সদস্যবৃন্দকে জানানো যাচ্ছে যে, চলতি মাসের মাসিক জমা ও কিস্তি নির্দিষ্ট সময়ের মধ্যে পরিশোধ করার জন্য অনুরোধ করা হলো। যেকোনো প্রয়োজনে সমিতির ড্যাশবোর্ড বা অফিস কর্তৃপক্ষের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* ==========================================
          3. BANK & MOBILE FINANCIAL INFORMATION
      ========================================== */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaUniversity className="text-blue-600" /> সমিতির অফিশিয়াল ব্যাংক ও পেমেন্ট অ্যাকাউন্টস
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bank Card (IFIC Bank) */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                <FaUniversity size={22} />
              </span>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Active Bank</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">IFIC Bank PLC</h4>
            <p className="text-xs text-slate-500 mt-1">Branch: Darus Salam Road, Mirpur</p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
              <p className="text-xs font-medium text-slate-600">A/C Name: <span className="text-slate-900 font-bold block text-xs mt-0.5">MD Hasan Al Mamun, MD Mahidul Mollla, MD Ahsanul Islam</span></p>
              <p className="text-xs font-medium text-slate-600 pt-1">A/C No: <span className="text-blue-600 font-mono font-bold text-sm">0200044702812</span></p>
            </div>
          </div>

          {/* MFS Card (Bkash, Nagad, Rocket) */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-pink-100 text-pink-600 p-3 rounded-xl">
                <FaMobileAlt size={22} />
              </span>
              <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full">Personal Wallets</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">bKash / Nagad / Rocket</h4>
            <p className="text-xs text-slate-500 mt-1">Official Personal Numbers</p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">bKash (Personal):</span>
                <span className="text-pink-600 font-mono font-bold">01314533222</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Nagad (Personal):</span>
                <span className="text-orange-600 font-mono font-bold">01400444424</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Rocket (Personal):</span>
                <span className="text-purple-600 font-mono font-bold">01400444424</span>
              </div>
            </div>
          </div>

          {/* Security Note Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                <FaShieldAlt /> নিরাপদ লেনদেন
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                টাকা পাঠানোর পর অবশ্যই রসিদ বা ট্রানজাকশন আইডি (TrxID) সংরক্ষণ করুন এবং সিস্টেমের পেমেন্ট সেকশনে সাবমিট করুন।
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              কর্তৃপক্ষ: Skylark Management
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