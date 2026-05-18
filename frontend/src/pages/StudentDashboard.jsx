import React from 'react';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Sticky Navbar Placeholder */}
      <div className="sticky top-0 z-50 h-16 bg-[#800000] w-full flex items-center justify-center text-white font-semibold">
        Navbar — gelecek
      </div>

      {/* Main 3-Column Layout Container */}
      <div className="flex flex-row gap-6 px-6 py-4 w-full flex-1">
        {/* Left Column */}
        <div className="w-64 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center h-96 text-gray-400 font-medium">
          Sol Kolon
        </div>

        {/* Center Column */}
        <div className="flex-1 border border-gray-200 rounded-xl bg-white p-4 min-h-[600px] flex items-center justify-center text-gray-400 font-medium">
          Ana Akış
        </div>

        {/* Right Column */}
        <div className="w-72 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center h-[450px] text-gray-400 font-medium">
          Sağ Kolon
        </div>
      </div>
    </div>
  );
}
