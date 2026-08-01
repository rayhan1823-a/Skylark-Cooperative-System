import React, { useState } from "react";
import { FaPlus, FaTrash, FaEye, FaImages, FaTimes } from "react-icons/fa";

function PhotoGallery() {
  // রোল চেক (স্টাফ বা অ্যাডমিন কিনা দেখার জন্য)
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "";
  const canManage = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);

  // ডেমো প্রাথমিক ছবি (আপনার প্রয়োজনমতো পরিবর্তন বা ব্যাকএন্ড থেকে ফেচ করতে পারেন)
  const [photos, setPhotos] = useState([
    {
      id: 1,
      title: "বার্ষিক সাধারণ সভা ২০২৬",
      category: "Meeting",
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop",
      date: "2026-01-15",
    },
    {
      id: 2,
      title: "মাসিক কিস্তি ও সঞ্চয় সংগ্রহ",
      category: "Collection",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
      date: "2026-02-10",
    },
    {
      id: 3,
      title: "পরিচালনা কমিটির বিশেষ বৈঠক",
      category: "Meeting",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
      date: "2026-03-05",
    },
  ]);

  // নতুন ছবি যোগ করার স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meeting");
  const [url, setUrl] = useState("");

  // ছবি বড় করে দেখার (Lightbox) স্টেট
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // নতুন ছবি সাবমিট করার ফাংশন
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!title || !url) return;

    const newPhoto = {
      id: Date.now(),
      title,
      category,
      url,
      date: new Date().toISOString().split("T")[0],
    };

    setPhotos([newPhoto, ...photos]);
    setTitle("");
    setUrl("");
    setIsModalOpen(false);
  };

  // ছবি ডিলিট করার ফাংশন
  const handleDelete = (id) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?")) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <FaImages size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ফটো গ্যালারি</h1>
            <p className="text-sm text-gray-500 mt-0.5">সমিতির বিভিন্ন কার্যক্রম ও ইভেন্টের আলোকচিত্র</p>
          </div>
        </div>

        {/* Add Photo Button (Admin/Staff Only) */}
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition duration-200 text-sm"
          >
            <FaPlus size={14} />
            <span>নতুন ছবি যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Image Box */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl transition shadow"
                    title="বড় করে দেখুন"
                  >
                    <FaEye size={16} />
                  </button>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="bg-rose-500/90 hover:bg-rose-600 text-white p-2.5 rounded-xl transition shadow"
                      title="ডিলিট করুন"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow">
                  {photo.category}
                </span>
              </div>

              {/* Content info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{photo.title}</h3>
                <p className="text-xs text-gray-400 mt-2">তারিখ: {photo.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">কোনো ছবি পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Add Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">নতুন ছবি যুক্ত করুন</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ছবির শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক সভা ২০২৬"
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
                  <option value="Collection">Collection</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ছবির লিংক (Image URL)</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

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

      {/* Lightbox Modal (View Full Image) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white">
              <h3 className="font-semibold text-sm">{selectedPhoto.title}</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[80vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;