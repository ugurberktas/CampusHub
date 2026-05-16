import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* SECTION 1 — NAVBAR */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Desktop LEFT */}
        <div className="hidden md:flex items-center space-x-6 flex-1">
          <Link to="/ogrenci-girisi" className="text-gray-500 hover:text-gray-800 cursor-pointer transition-colors font-medium">Öğrenciler</Link>
          <Link to="/topluluk-girisi" className="text-gray-500 hover:text-gray-800 cursor-pointer transition-colors font-medium">Topluluklar</Link>
        </div>

        {/* CENTER Logo */}
        <div className="flex items-center justify-center flex-1 md:flex-none">
          <div className="flex items-center space-x-2">
            <span className="text-2xl text-[#800000]">◈</span>
            <span className="font-bold text-[#800000] text-xl tracking-tight">Campus Hub</span>
          </div>
        </div>

        {/* Desktop RIGHT */}
        <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">
          <span className="text-gray-500 hover:text-gray-800 cursor-pointer transition-colors font-medium">İstatistikler</span>
          <Link 
            to="/ogrenci-girisi" 
            className="bg-[#800000] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#600000] transition-colors"
          >
            Giriş Yap
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex-1 flex justify-end">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 focus:outline-none"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4 shadow-sm">
          <Link to="/ogrenci-girisi" className="block text-gray-500 font-medium py-2">Öğrenciler</Link>
          <Link to="/topluluk-girisi" className="block text-gray-500 font-medium py-2">Topluluklar</Link>
          <div className="block text-gray-500 font-medium py-2">İstatistikler</div>
          <Link 
            to="/ogrenci-girisi" 
            className="block text-center bg-[#800000] text-white px-4 py-3 rounded-lg font-medium"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {/* SECTION 2 — HERO */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 sm:px-6 py-20 text-center">
        {/* Overline */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-8 sm:w-12 h-[1px] bg-gray-300"></div>
          <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">
            Fırat Üniversitesi İçin Tasarlandı
          </span>
          <div className="w-8 sm:w-12 h-[1px] bg-gray-300"></div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-black text-[#111111] leading-[1.1] max-w-4xl mb-6">
          Kampüs hayatını{' '}
          <span className="relative inline-block">
            keşfet
            <span className="absolute bottom-0 left-0 w-full h-[40%] bg-[#80000020] rounded-[2px] -z-10" />
          </span>
          , topluluğuna katıl.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
          Campus Hub ile çevrenizdeki etkinliklerden anında haberdar olun, QR ile yoklama verin ve dijital kampüsün tadını çıkarın.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 w-full sm:w-auto">
          <Link 
            to="/ogrenci-girisi"
            className="w-full sm:w-auto bg-[#800000] text-white px-8 py-3.5 rounded-lg font-medium hover:bg-[#600000] transition-colors"
          >
            Hemen Giriş Yap
          </Link>
          <button 
            type="button"
            className="w-full sm:w-auto bg-transparent border border-[#111111] text-[#111111] px-8 py-3.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Toplulukları İncele
          </button>
        </div>

        {/* Pill badge */}
        <div className="inline-flex items-center justify-center bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-sm font-medium">
          ↓ Etkinlikleri Yakala!
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-4xl pt-16">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:scale-[1.02] hover:shadow-lg cursor-pointer transition-all duration-200 flex-1 text-left">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="font-bold text-xl text-[#111] mb-1">Öğrenci</h3>
            <p className="text-gray-500 text-sm mb-6">Etkinliklere katıl, yoklama ver</p>
            <Link 
              to="/ogrenci-girisi"
              className="block w-full text-center bg-[#800000] text-white rounded-lg py-2.5 font-medium hover:bg-[#600000] transition-colors"
            >
              Giriş Yap
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:scale-[1.02] hover:shadow-lg cursor-pointer transition-all duration-200 flex-1 text-left">
            <div className="text-3xl mb-4">🏛️</div>
            <h3 className="font-bold text-xl text-[#111] mb-1">Topluluk</h3>
            <p className="text-gray-500 text-sm mb-6">Üyelerini yönet, etkinlik oluştur</p>
            <Link 
              to="/topluluk-girisi"
              className="block w-full text-center bg-[#800000] text-white rounded-lg py-2.5 font-medium hover:bg-[#600000] transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>

      {/* SECTION 3 — FOOTER */}
      <footer className="py-8 text-center text-xs text-gray-400">
        <p>
          Tüm Hakları Saklıdır © 2026{' '}
          <Link 
            to="/sks-giris" 
            className="text-inherit cursor-default no-underline hover:no-underline"
          >
            Campus Hub
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
