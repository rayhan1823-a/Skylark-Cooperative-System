import React, { useState, useEffect } from "react";
import { X, BellRing } from "lucide-react";

function PopupModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasClosedPopup = sessionStorage.getItem("popupClosed");
    if (!hasClosedPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("popupClosed", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        
        {/* Header Design */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl shadow-inner">
              <BellRing size={24} className="text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide">জরুরি নোটিশ ও ঘোষণা</h3>
              <p className="text-xs text-blue-200">Skylark Cooperative Society</p>
            </div>
          </div>
          
          {/* X (Close) Button */}
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition duration-200 focus:outline-none"
            title="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/70 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-3">
            <p className="text-gray-800 text-base font-medium leading-relaxed">
              সম্মানিত সদস্যবৃন্দের অবগতির জন্য জানানো যাচ্ছে যে, প্রতি মাসের <span className="font-bold text-blue-900">১৫ তারিখের</span> মধ্যে সকল বকেয়া পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হলো।
            </p>
            <div className="text-right pt-2 border-t border-blue-100">
              <p className="text-xs text-gray-500">বিনীত নিবেদক,</p>
              <p className="text-sm font-semibold text-blue-900">স্কাইলার্ক পরিচালনা কমিটি</p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="bg-gray-50 px-6 py-3.5 flex justify-end border-t border-gray-100">
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-md transition duration-200 w-full sm:w-auto"
          >
            বুঝেছি / ঠিক আছে
          </button>
        </div>

      </div>
    </div>
  );
}

export default PopupModal;