import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [content, setContent] = useState({ title: '', subtitle: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // লোকালস্টোরেজ থেকে রিয়েল ইউজার এবং রোল নেওয়া
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userRole = user.role || ""; 

  // পেজ লোড হলে ব্যাকএন্ড থেকে হোম পেজের টেক্সট ফেচ করা
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/home');
      if (res.data) {
        setContent(res.data);
      }
    } catch (err) {
      console.error("Error fetching home content:", err);
    }
  };

  // হোম পেজের টেক্সট আপডেট বা সেভ করার হ্যান্ডলার
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/home', content);
      setContent(res.data.content);
      setIsEditing(false);
      alert("হোম পেজের লেখা সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      console.error("Update error:", err);
      alert("আপডেট করতে ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      {/* হোম পেজের মূল ব্যানার/ওয়েলকাম সেকশন */}
      <div className="bg-slate-800 p-8 rounded-2xl relative shadow-lg border border-slate-700">
        <span className="bg-blue-600 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          WELCOME HOME
        </span>
        
        <h1 className="text-3xl md:text-4xl font-bold mt-4 text-white">
          {content.title || "সমিতি হোম পেজ (Somiti Home)"}
        </h1>
        
        <p className="mt-2 text-gray-300 text-lg">
          {content.subtitle || "স্বাগতম! সমিতির মূল তথ্যাবলী ও আপডেট এখানে দেখতে পাবেন।"}
        </p>

        {/* সুপার অ্যাডমিন থাকলে এডিট বাটন দেখাবে */}
        {userRole === "SUPER_ADMIN" && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="absolute top-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
          >
            ✏️ Edit Content
          </button>
        )}
      </div>

      {/* এডিট করার ফর্ম (যখন এডিট মোড অন থাকবে) */}
      {isEditing && (
        <div className="mt-6 bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">হোম পেজ কনটেন্ট এডিট করুন</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">শিরোনাম (Title):</label>
              <input 
                type="text" 
                value={content.title} 
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">সাবটাইটেল বা বিবরণ (Subtitle):</label>
              <textarea 
                value={content.subtitle} 
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                rows="3"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium transition duration-200"
              >
                {loading ? "সংরক্ষণ হচ্ছে..." : "Save Changes"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* অন্যান্য সেকশন বা নোটিশ বোর্ড */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h4 className="font-bold text-lg text-emerald-400 mb-2">নোটিশ বোর্ড</h4>
          <p className="text-gray-300 text-sm">সমিতির সাম্প্রতিক সকল গুরুত্বপূর্ণ নোটিশ ও ঘোষণা এখানে প্রদর্শিত হবে।</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h4 className="font-bold text-lg text-blue-400 mb-2">আর্থিক সারাংশ</h4>
          <p className="text-gray-300 text-sm">সঞ্চয়, ডিপোজিট এবং লোন সম্পর্কিত ড্যাশবোর্ড ওভারভিউ।</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h4 className="font-bold text-lg text-purple-400 mb-2">দ্রুত লিংক</h4>
          <p className="text-gray-300 text-sm">মেম্বার লিস্ট এবং গ্যালারি পেজে দ্রুত যাওয়ার শর্টকাট।</p>
        </div>
      </div>
    </div>
  );
};

export default Home;