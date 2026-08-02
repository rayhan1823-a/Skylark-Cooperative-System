import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaPlay, FaVideo, FaTimes, FaLink, FaUpload } from "react-icons/fa";

function VideoGallery() {
  // API Base URL
  const API = "https://skylark-cooperative-system.onrender.com/api";

  // রোল সঠিকভাবে এবং নিরাপদে চেক করার ফাংশন
  const getUserRole = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        if (typeof storedUser === "string") return storedUser.trim();
        return storedUser.role || storedUser.userType || storedUser.type || "";
      }
      return localStorage.getItem("role") || localStorage.getItem("userRole") || "";
    } catch (e) {
      return localStorage.getItem("user") || "";
    }
  };

  const rawRole = getUserRole();
  const role = typeof rawRole === "string" ? rawRole.toUpperCase() : "";
  
  const canUpload = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
  const canDelete = role === "SUPER_ADMIN";

  // স্টেটসমূহ
  const [videos, setVideos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meeting");
  
  const [videoInputType, setVideoInputType] = useState("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);

  const [selectedVideo, setSelectedVideo] = useState(null);

  // কম্পোনেন্ট লোড হওয়ার সাথে সাথে ব্যাকএন্ড থেকে ভিডিও ফেচ করা
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API}/videos`);
      const data = await res.json();

      if (data.success) {
        setVideos(data.data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // নতুন ভিডিও সাবমিট করার ফাংশন (POST Request with FormData)
  const handleAddVideo = async (e) => {
    e.preventDefault();

    // ১. Title + Validation (YouTube URL অথবা Upload File)
    if (!title) {
      alert("Title আবশ্যক");
      return;
    }

    if (videoInputType === "youtube" && !youtubeUrl) {
      alert("YouTube URL আবশ্যক");
      return;
    }

    if (videoInputType === "upload" && !selectedVideoFile) {
      alert("Upload করার জন্য ভিডিও ফাইল আবশ্যক");
      return;
    }

    if (!canUpload) {
      alert("আপনার ভিডিও আপলোড করার অনুমতি নেই!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // JSON এর বদলে FormData ব্যবহার করা হলো
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("type", videoInputType);
      
      if (videoInputType === "youtube") {
        formData.append("youtubeUrl", youtubeUrl);
      } else if (videoInputType === "upload" && selectedVideoFile) {
        formData.append("video", selectedVideoFile);
      }

      const res = await fetch(`${API}/videos`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        await fetchVideos();
        setTitle("");
        setCategory("Meeting");
        setYoutubeUrl("");
        setVideoInputType("youtube");
        setSelectedVideoFile(null);
        setIsModalOpen(false);
      } else {
        alert(data.message || "ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  // ভিডিও ডিলিট করার ফাংশন (DELETE Request)
  const handleDelete = async (id) => {
    if (!canDelete) {
      alert("দুঃখিত, শুধুমাত্র সুপার অ্যাডমিন (SUPER_ADMIN) ভিডিও ডিলিট করতে পারবেন!");
      return;
    }

    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/videos/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.success) {
          await fetchVideos();
        } else {
          alert(data.message || "ভিডিও ডিলিট করা যায়নি।");
        }
      } catch (error) {
        console.error(error);
        alert("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
      }
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

        {canUpload && (
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
              key={video._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Video Thumbnail Box */}
              <div className="relative h-48 overflow-hidden bg-gray-900">
                <img
                  src={
                    video.type === "youtube"
                      ? `https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`
                      : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
                  }
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />

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

                {canDelete && (
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="absolute top-3 right-3 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition shadow z-20"
                    title="ডিলিট করুন"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>

              {/* Content info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{video.title}</h3>
                
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span>আপলোডকারী: <strong className="text-gray-600">{video.uploadedBy?.name || "অজ্ঞাত"}</strong></span>
                  <span>{new Date(video.date).toLocaleDateString()}</span>
                </div>
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
      {isModalOpen && canUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">নতুন ভিডিও যুক্ত করুন</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTitle("");
                  setCategory("Meeting");
                  setYoutubeUrl("");
                  setVideoInputType("youtube");
                  setSelectedVideoFile(null);
                }}
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
                  <option value="Foundation Anniversary">Foundation Anniversary</option>
                  <option value="Annual Picnic">Annual Picnic</option>
                  <option value="Cultural Program">Cultural Program</option>
                  <option value="Prize Giving">Prize Giving</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  ভিডিওর উৎস মাধ্যম
                </label>

                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setVideoInputType("youtube")}
                    className={`py-2 rounded-lg text-xs font-semibold transition ${
                      videoInputType === "youtube"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    <FaLink className="inline mr-1" />
                    YouTube
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoInputType("upload")}
                    className={`py-2 rounded-lg text-xs font-semibold transition ${
                      videoInputType === "upload"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    <FaUpload className="inline mr-1" />
                    Upload
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {videoInputType === "youtube" ? "ইউটিউব লিংক (YouTube URL)" : "ভিডিও ফাইল নির্বাচন করুন"}
                </label>
                {videoInputType === "youtube" ? (
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                  />
                ) : (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedVideoFile(e.target.files[0])}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setTitle("");
                    setCategory("Meeting");
                    setYoutubeUrl("");
                    setVideoInputType("youtube");
                    setSelectedVideoFile(null);
                  }}
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
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={`https://skylark-cooperative-system.onrender.com/${selectedVideo.videoUrl}`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGallery;