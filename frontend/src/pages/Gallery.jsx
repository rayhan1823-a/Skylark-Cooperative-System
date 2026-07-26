import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaImages, FaVideo, FaPlus, FaTrash, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

function Gallery() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState("images"); // 'images' or 'videos'

  // ডেমো ডাটা (পরবর্তীতে ব্যাকএন্ড বা API থেকে নিয়ে আসতে পারবেন)
  const [images, setImages] = useState([
    { id: 1, title: "বার্ষিক সাধারণ সভা ২০২৬", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500" },
    { id: 2, title: "সমিতির প্রজেক্ট পরিদর্শন", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500" },
  ]);

  const [videos, setVideos] = useState([
    { id: 1, title: "মাসিক মিটিং ভিডিও ক্লিপ", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ]);

  // নতুন ফাইল যোগ করার হ্যান্ডলার (শুধুমাত্র Super Admin পারবে)
  const handleUpload = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("আপনার গ্যালারিতে কন্টেন্ট আপলোড করার অনুমতি নেই!");
      return;
    }
    toast.success("সফলভাবে আপলোড করা হয়েছে! (Backend API কানেক্ট করে নিতে পারেন)");
  };

  // ডিলিট হ্যান্ডলার (শুধুমাত্র Super Admin পারবে)
  const handleDelete = (id, type) => {
    if (!isSuperAdmin) {
      toast.error("শুধুমাত্র Super Admin এটি ডিলিট করতে পারবেন!");
      return;
    }
    if (type === "image") {
      setImages(images.filter((img) => img.id !== id));
    } else {
      setVideos(videos.filter((vid) => vid.id !== id));
    }
    toast.success("সফলভাবে ডিলিট করা হয়েছে!");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/85 border border-slate-800 p-6 rounded-3xl shadow-xl mb-8 gap-4">
          <div>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Somiti Gallery
            </span>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
              ইমেজ ও ভিডিও গ্যালারি
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              সমিতির সকল স্মরণীয় মুহূর্ত, ছবি এবং ভিডিও ক্লিপ এখানে সংরক্ষিত আছে।
            </p>
          </div>

          {/* Tabs Switcher */}
          <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "images"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaImages /> Image Gallery
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "videos"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaVideo /> Video Gallery
            </button>
          </div>
        </div>

        {/* Super Admin Upload Section (অন্য কেউ দেখতে পেলেও আপলোড বাটন রেস্ট্রিক্টেড থাকবে) */}
        {isSuperAdmin && (
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl mb-8 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <FaPlus className="text-blue-500" /> নতুন ছবি বা ভিডিও আপলোড করুন (Super Admin Only)
            </h3>
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="টাইটেল লিখুন..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="file"
                className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                আপলোড করুন
              </button>
            </form>
          </div>
        )}

        {/* Content Display Area */}
        {activeTab === "images" ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">সকল ছবিসমূহ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div key={img.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{img.title}</h4>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(img.id, "image")}
                        className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-xl border border-rose-500/20 transition-all"
                        title="Delete Image"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">সকল ভিডিওসমূহ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div key={vid.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="h-48 relative">
                    <iframe src={vid.url} title={vid.title} className="w-full h-full" allowFullScreen></iframe>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{vid.title}</h4>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(vid.id, "video")}
                        className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-xl border border-rose-500/20 transition-all"
                        title="Delete Video"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Gallery;