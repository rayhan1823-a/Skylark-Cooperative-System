import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaImages, 
  FaTimes, 
  FaSearch, 
  FaEdit, 
  FaSpinner, 
  FaExclamationCircle, 
  FaRedo
} from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

function PhotoGallery() {
  // API_URL trailing slash fix
  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

  // রোল ও টোকেন ম্যানেজমেন্ট হেল্পার
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

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  // স্টেটসমূহ
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ডাইনামিক রোল আপডেট এবং স্টোরেজ ইভেন্ট লিসেনার
  const [role, setRole] = useState("");
  
  useEffect(() => {
    const updateRole = () => {
      const rawRole = getUserRole();
      setRole(typeof rawRole === "string" ? rawRole.toUpperCase() : "");
    };

    updateRole();
    window.addEventListener("storage", updateRole);
    return () => window.removeEventListener("storage", updateRole);
  }, []);

  const canUpload = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
  const canDelete = role === "SUPER_ADMIN";

  // মডাল ও ফর্ম স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState(null);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meeting");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // সার্চ ও ফিল্টার স্টেট
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // লাইটবক্স স্টেট
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // ক্যাটাগরি লিস্ট
  const categoriesList = [
    "Meeting",
    "Collection",
    "Foundation Anniversary",
    "Annual Picnic",
    "Cultural Program",
    "Prize Giving",
    "Event",
    "General"
  ];

  // Component Unmount Memory Leak Clean up করার জন্য useRef
  const previewUrlRef = useRef(previewUrl);
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      const currentUrl = previewUrlRef.current;
      if (currentUrl && currentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, []);

  // Fetch Controller & Request ID Ref (Race condition & cleanup handle করার জন্য)
  const fetchControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Helper Function: Image URL নির্ধারণ
  const getImageUrl = (photo) => {
    if (!photo) return "/placeholder.png";
    const image = photo.imageUrl || photo.url;
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return `${API_URL}/${image.replace(/^\//, "")}`;
  };

  // fetchPhotos with Race Condition Protection
  const fetchPhotos = async (signal) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/api/photos`, {
        signal,
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const list = response.data?.data ?? response.data?.photos ?? response.data ?? [];
      setPhotos(Array.isArray(list) ? list : []);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Fetch Error:", err);
        setError("ছবিগুলো লোড করতে সমস্যা হয়েছে।");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Initial Fetch with AbortController
  useEffect(() => {
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    fetchPhotos(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  // Robust retryFetch with Abort Controller
  const retryFetch = () => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    fetchPhotos(controller.signal);
  };

  // ফাইল সিলেক্ট ও ভ্যালিডেশন
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("ফাইলের সাইজ ১০MB এর বেশি হতে পারবে না!");
        e.target.value = "";
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("শুধুমাত্র JPEG, JPG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে!");
        e.target.value = "";
        return;
      }

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Modal Close & Clean up
  const handleCloseModal = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentPhotoId(null);
    setTitle("");
    setCategory("Meeting");
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Add Modal Open (Reset previous state)
  const handleOpenAdd = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setIsEditMode(false);
    setCurrentPhotoId(null);
    setTitle("");
    setCategory("Meeting");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  // Edit Preview URL হ্যান্ডলিং
  const handleOpenEdit = (photo) => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setIsEditMode(true);
    setCurrentPhotoId(photo._id || photo.id);
    setTitle(photo.title || "");
    setCategory(photo.category || "Meeting");
    
    const imagePath = photo.imageUrl || photo.url;
    const initialPreview = imagePath
      ? (imagePath.startsWith("http") ? imagePath : `${API_URL}/${imagePath.replace(/^\//, "")}`)
      : "";
    setPreviewUrl(initialPreview);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUpload) {
      toast.error("আপনার ছবি আপলোড করার অনুমতি নেই!");
      return;
    }
    if (!title.trim()) {
      toast.error("অনুগ্রহ করে শিরোনাম দিন।");
      return;
    }

    if (!isEditMode && !selectedFile) {
      toast.error("অনুগ্রহ করে একটি ছবি সিলেক্ট করুন।");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const token = getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    setSaving(true);
    const loadingToast = toast.loading(isEditMode ? "ছবি আপডেট হচ্ছে..." : "ছবি আপলোড হচ্ছে...");

    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/api/photos/${currentPhotoId}`, formData, { headers });
        toast.success("ছবি সফলভাবে আপডেট করা হয়েছে!", { id: loadingToast });
      } else {
        await axios.post(`${API_URL}/api/photos`, formData, { headers });
        toast.success("ছবি সফলভাবে আপলোড করা হয়েছে!", { id: loadingToast });
      }

      handleCloseModal();
      retryFetch();
    } catch (err) {
      console.error("Upload/Update Error:", err);
      toast.error(err.response?.data?.message || (isEditMode ? "ছবি আপডেট করতে সমস্যা হয়েছে!" : "ছবি আপলোড করতে সমস্যা হয়েছে!"), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  // ছবি ডিলিট করা
  const handleDelete = async (id) => {
    if (!canDelete) {
      toast.error("দুঃখিত, শুধুমাত্র সুপার অ্যাডমিন (SUPER_ADMIN) ছবি ডিলিট করতে পারবেন!");
      return;
    }

    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই ছবিটি স্থায়ীভাবে মুছে ফেলা হবে!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন",
      cancelButtonText: "বাতিল"
    });

    if (result.isConfirmed) {
      const token = getToken();
      try {
        await axios.delete(`${API_URL}/api/photos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("ছবি সফলভাবে মুছে ফেলা হয়েছে!");
        retryFetch();
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error(err.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  // Search filter
  const filteredPhotos = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    return photos.filter((photo) => {
      const photoTitle = (photo.title || "").toLowerCase();
      const matchesSearch = photoTitle.includes(trimmedSearch);
      const matchesCategory = selectedCategory === "All" || photo.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [photos, searchTerm, selectedCategory]);

  // Lightbox Keyboard Navigation (Input/Textarea check সহ)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

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

        {canUpload && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition duration-200 text-sm cursor-pointer"
          >
            <FaPlus size={14} />
            <span>নতুন ছবি যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="ছবি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            সকল ক্যাটাগরি
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error State UI & Retry Button */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <FaExclamationCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={retryFetch}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo size={11} className={loading ? "animate-spin" : ""} />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Skeleton / Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Gallery Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPhotos.length > 0 ? (
            filteredPhotos.map((photo, index) => {
              const photoId = photo._id || photo.id;
              const imageSrc = getImageUrl(photo);

              const rawDate = photo.createdAt || photo.date;
              const parsedDate = new Date(rawDate);
              const formattedDate = !isNaN(parsedDate.getTime()) 
                ? parsedDate.toLocaleDateString("bn-BD") 
                : "তারিখ উপলব্ধ নেই";

              return (
                <div
                  key={photoId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col relative"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={imageSrc}
                      alt={photo.title || "Gallery Image"}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.png";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedPhotoIndex(index)}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl transition shadow cursor-pointer"
                        title="বড় করে দেখুন"
                      >
                        <FaEye size={16} />
                      </button>
                    </div>

                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow z-10">
                      {photo.category || "General"}
                    </span>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      {canUpload && (
                        <button
                          onClick={() => handleOpenEdit(photo)}
                          className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl transition shadow cursor-pointer"
                          title="এডিট করুন"
                        >
                          <FaEdit size={13} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(photoId)}
                          className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition shadow cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <FaTrash size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{photo.title || "শিরোনাম নেই"}</h3>
                    <p className="text-xs text-gray-400 mt-2">
                      তারিখ: {formattedDate}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm">কোনো ছবি পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Photo Modal */}
      {isModalOpen && canUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" 
             onKeyDown={(e) => { if (e.key === "Escape" && saving) e.stopPropagation(); }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">
                {isEditMode ? "ছবি এডিট করুন" : "নতুন ছবি যুক্ত করুন"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEditMode ? "নতুন ছবি পরিবর্তন করতে চাইলে সিলেক্ট করুন" : "ডিভাইস থেকে ছবি সিলেক্ট করুন (সর্বোচ্চ ১০MB)"}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  required={!isEditMode}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="relative w-full h-36 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    decoding="async"
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = "/placeholder.png"; 
                    }}
                    className="h-full w-full object-contain" 
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <FaSpinner className="animate-spin" size={14} />}
                  <span>{isEditMode ? "আপডেট করুন" : "সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white">
              <h3 className="font-semibold text-sm">
                {filteredPhotos[selectedPhotoIndex].title || "ছবি"} ({selectedPhotoIndex + 1} / {filteredPhotos.length})
              </h3>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[80vh] relative">
              <img
                src={getImageUrl(filteredPhotos[selectedPhotoIndex])}
                alt={filteredPhotos[selectedPhotoIndex].title || "Lightbox Image"}
                decoding="async"
                onError={(e) => { 
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = "/placeholder.png"; 
                }}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-slate-950 text-center text-xs text-slate-400">
              কী-বোর্ডের <span className="text-white font-bold">ESC</span> চেপে বন্ধ করুন অথবা <span className="text-white font-bold">← →</span> তীর চিহ্ন দিয়ে পরিবর্তন করুন।
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;