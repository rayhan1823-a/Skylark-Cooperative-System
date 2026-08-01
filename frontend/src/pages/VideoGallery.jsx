import React, { useState } from "react";
import { FaPlus, FaTrash, FaPlay, FaVideo, FaTimes, FaLink, FaUpload } from "react-icons/fa";

function VideoGallery() {
  // রোল চেক (স্টাফ বা অ্যাডমিন কিনা দেখার জন্য)
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "";
  const canManage = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);

  // ডেমো প্রাথমিক ভিডিও লিস্ট
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "সমিতির বার্ষিক সাধারণ সভা ২০২৬ এর সম্পূর্ণ আলোচনা",
      category: "Meeting",
      type: "youtube", // 'youtube' অথবা 'upload'
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
      embedId: "dQw4w9WgXcQ", 
      date: "2026-01-16",
    },
    {
      id: 2,
      title: "সঞ্চয় ও শেয়ার ডিপোজিট নির্দেশিকা",
      category: "Tutorial",
      type: "youtube",
      youtubeUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
      embedId: "3JZ_D3ELwOQ",
      date: "2026-02-12",
    },
  ]);

  // নতুন ভিডিও যোগ করার স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meeting");
  
  // নতুন আপলোড ফিচার সম্পর্কিত স্টেট
  const [videoInputType, setVideoInputType] = useState("youtube"); // 'youtube' অথবা 'upload'
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);

  // ভিডিও প্লে করার জন্য মোডাল স্টেট
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ইউটিউব লিংক থেকে ভিডিও আইডি এক্সট্রাক্ট করার ফাংশন
  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // নতুন ভিডিও সাবমিট করার ফাংশন
  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!title) return;

    let newVideoData = {
      id: Date.now(),
      title,
      category,
      type: videoInputType,
      date: new Date().toISOString().split("T")[0],
    };

    if (videoInputType === "youtube") {
      if (!youtubeUrl) return;
      const embedId = extractYoutubeId(youtubeUrl);
      if (!embedId) {
        alert("দয়া করে একটি সঠিক ইউটিউব লিংক (YouTube URL) প্রদান করুন।");
        return;
      }
      newVideoData.youtubeUrl = youtubeUrl;
      newVideoData.embedId = embedId;
    } else {
      if (!selectedVideoFile) return;
      // ব্রাউজারে লোকাল ভিডিও প্রিভিউ বা প্লে করার জন্য অবজেক্ট ইউআরএল তৈরি
      newVideoData.videoUrl = URL.createObjectURL(selectedVideoFile);
    }

    setVideos([newVideoData, ...videos]);
    setTitle("");
    setYoutubeUrl("");
    setSelectedVideoFile(null);
    setIsModalOpen(false);
  };

  // ভিডিও ডিলিট করার ফাংশন
  const handleDelete = (id) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?")) {
      setVideos(videos.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <FaVideo size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ভিডিও গ্যালারি</h1>
            <p className="text-sm text-gray-500 mt-0.5">সমিতির সভা, টিউটোরিয়াল ও ইভেন্টের ভিডিও ক্লিপ</p>
          </div>
        </div>

        {/* Add Video Button (Admin/Staff Only) */}
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition duration-200 text-sm"
          >
            <FaPlus size={14} />
            <span>নতুন ভিডিও যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Video Thumbnail Box */}
              <div className="relative h-48 overflow-hidden bg-gray-900">
                {video.type === "youtube" ? (
                  <img
                    src={`https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-gray-300 font-medium text-xs">
                    [আপলোড করা ভিডিও ফাইল]
                  </div>
                )}

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg transition transform group-hover:scale-110"
                    title="ভিডিও প্লে করুন"
                  >
                    <FaPlay size={16} className="ml-0.5" />
                  </button>
                </div>
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow">
                  {video.category}
                </span>

                {canManage && (
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="absolute top-3 right-3 bg-rose-500/90 hover:bg-rose-600 text-white p-2 rounded-xl transition shadow opacity-0 group-hover:opacity-100"
                    title="ডিলিট করুন"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>

              {/* Content info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-400 mt-2">তারিখ: {video.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">কোনো ভিডিও পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">নতুন ভিডিও যুক্ত করুন</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ভিডিওর শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক সভা ২০২৬ আলোচনা"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* ভিডিও যোগ করার মাধ্যম সিলেকশন (YouTube vs Upload File) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ভিডিওর উৎস মাধ্যম</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setVideoInputType("youtube")}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                      videoInputType === "youtube" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <FaLink size={12} />
                    <span>ইউটিউব লিংক</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoInputType("upload")}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                      videoInputType === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <FaUpload size={12} />
                    <span>ভিডিও ফাইল আপলোড</span>
                  </button>
                </div>
              </div>

              {videoInputType === "youtube" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ইউটিউব লিংক (YouTube URL)</label>
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ডিভাইস থেকে ভিডিও ফাইল সিলেক্ট করুন (MP4)</label>
                  <input
                    type="file"
                    accept="video/*"
                    required
                    onChange={(e) => setSelectedVideoFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal (Lightbox) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white">
              <h3 className="font-semibold text-sm">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {selectedVideo.type === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                ></video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGallery;