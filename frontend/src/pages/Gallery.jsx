import React, { useState, useEffect } from 'react';
import axios from 'axios';

// রেন্ডার লাইভ সার্ভার লিংক যুক্ত করা হলো
const API_URL = "https://skylark-cooperative-system.onrender.com";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // লোকালস্টোরেজ থেকে রিয়েল ইউজার এবং রোল নেওয়া
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userRole = user.role || ""; 

  // পেজ লোড হলে গ্যালারির ছবিগুলো ফেচ করা
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/gallery`);
      setImages(res.data);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    }
  };

  // ছবি আপলোড হ্যান্ডলার
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("দয়া করে একটি ছবি সিলেক্ট করুন!");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
      setTitle('');
      setFile(null);
      e.target.reset();
      fetchImages();
    } catch (err) {
      console.error("Upload error:", err);
      alert("ছবি আপলোড ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  // ছবি ডিলিট করার ফাংশন (সুপার অ্যাডমিনের জন্য)
  const handleDelete = async (id) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ছবি ডিলিট করতে চান?")) {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        await axios.delete(`${API_URL}/api/gallery/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert("ছবি ডিলিট করা হয়েছে!");
        fetchImages();
      } catch (err) {
        console.error("Delete error:", err);
        alert("ডিলিট করতে সমস্যা হয়েছে!");
      }
    }
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">গ্যালারি (Gallery)</h2>

      {/* সুপার অ্যাডমিন আপলোড ফর্ম */}
      {userRole === "SUPER_ADMIN" && (
        <div className="bg-slate-800 p-6 rounded-xl mb-8 border border-slate-700 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">নতুন ছবি যোগ করুন</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">ছবির শিরোনাম (Title):</label>
              <input 
                type="text" 
                placeholder="যেমন: বার্ষিক বনভোজন ২০২৬..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-900 rounded border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">ছবি সিলেক্ট করুন (Image File):</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium transition duration-200"
            >
              {loading ? "আপলোড হচ্ছে..." : "Upload Image"}
            </button>
          </form>
        </div>
      )}

      {/* গ্যালারি গ্রিড (ছবিগুলো প্রদর্শনের জায়গা) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.length > 0 ? (
          images.map((img) => (
            <div key={img._id} className="bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-700 flex flex-col justify-between">
              <div>
                <img 
                  src={img.imageUrl} 
                  alt={img.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-lg text-white truncate">{img.title}</h4>
                </div>
              </div>
              
              {/* সুপার অ্যাডমিন চাইলে ছবি ডিলিট করতে পারবেন */}
              {userRole === "SUPER_ADMIN" && (
                <div className="px-4 pb-4">
                  <button 
                    onClick={() => handleDelete(img._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-sm transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 col-span-full text-center py-8">গ্যালারিতে কোনো ছবি পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;