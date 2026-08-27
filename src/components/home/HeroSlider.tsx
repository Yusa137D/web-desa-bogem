"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  bgClass: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    title: "Selamat Datang di Website Resmi Desa Bogem",
    subtitle: "Kecamatan Kawedanan, Kabupaten Magetan",
    description: "Pusat informasi publik, layanan pemerintahan transparan, dan etalase digital potensi ekonomi warga desa.",
    badge: "Portal Resmi Digital Desa",
    bgClass: "from-[#002B1B] via-[#004329] to-[#006643]",
  },
  {
    title: "Pemerintah Desa Bogem & Tata Kelola Modern",
    subtitle: "Melayani dengan Sepenuh Hati",
    description: "Mewujudkan pelayanan masyarakat yang cepat, prima, dan inklusif dengan pemanfaatan teknologi informasi.",
    badge: "SOTK & Aparatur Desa",
    bgClass: "from-[#003722] via-[#004E32] to-[#00734D]",
  },
  {
    title: "Dukung UMKM & Beli dari Desa",
    subtitle: "Karya Unggulan Masyarakat Lokal",
    description: "Temukan ragam olahan makanan lezat, kerajinan tangan khas, dan hasil bumi langsung dari petani & perajin desa.",
    badge: "Etalase Toko Digital",
    bgClass: "from-[#002819] via-[#003B24] to-[#005B3A]",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      // Pause if tab is not active
      if (typeof document !== "undefined" && document.hidden) return;
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className={`bg-gradient-to-br ${slide.bgClass} text-white py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-700`}>
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Main Hero Content */}
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <span>{slide.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            <p className="text-emerald-200 font-semibold text-sm sm:text-base lg:text-lg">
              {slide.subtitle}
            </p>

            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <Link
                href="/potensi"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-[#00321F] font-extrabold py-3 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all text-xs sm:text-sm active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Jelajahi Produk UMKM</span>
              </Link>
              <Link
                href="/profil"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-emerald-400/40 font-bold py-3 px-6 rounded-2xl backdrop-blur transition-all text-xs sm:text-sm active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Profil & SOTK Desa</span>
              </Link>
            </div>
          </div>

          {/* Slider Controls (Desktop & Tablet) */}
          <div className="flex lg:flex-col items-center justify-center gap-3 pt-2 lg:pt-0">
            <div className="flex items-center space-x-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-8 bg-emerald-300" : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition active:scale-90"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition active:scale-90"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
