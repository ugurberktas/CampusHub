import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ClubDashboard() {
  const { user, logout } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get('/clubs');
        // Find the user's club where advisor_email matches or fallback to the first club in list
        const foundClub = response.data.find(
          (c) =>
            c.advisor_email === user?.email ||
            c.name.toLowerCase().includes(user?.full_name?.toLowerCase())
        ) || response.data[0];

        setClub(foundClub || null);
      } catch (err) {
        console.error('Kulüp yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClub();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans">
        <div className="text-gray-400 text-sm animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  if (!club || club.status === 'pending' || club.status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center gap-4 max-w-md text-center">
          <span className="text-5xl animate-bounce select-none">⏳</span>
          <h2 className="text-gray-800 font-bold text-xl">
            Başvurunuz İnceleniyor
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            SKS yetkilisi kulübünüzü onayladıktan sonra panele erişebileceksiniz.
          </p>
          <button
            onClick={logout}
            className="mt-4 px-6 py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  if (club.status === 'active') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
        {/* Navbar Placeholder */}
        <div className="sticky top-0 z-50 h-16 bg-[#800000] w-full flex items-center justify-center">
          <span className="text-white font-semibold">Navbar — gelecek</span>
        </div>

        {/* 3 Column Layout */}
        <div className="flex flex-row gap-6 px-6 py-4 w-full">
          {/* Left Column */}
          <div className="w-64 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center">
            <span className="text-gray-400 font-medium">Sol Kolon</span>
          </div>

          {/* Center Column */}
          <div className="flex-1 border border-gray-200 rounded-xl bg-white p-4 min-h-[600px] flex items-center justify-center">
            <span className="text-gray-400 font-medium">Ana Akış</span>
          </div>

          {/* Right Column */}
          <div className="w-72 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center">
            <span className="text-gray-400 font-medium">Sağ Kolon</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
