"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Landmark, ShoppingBag, Users, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: typeof Landmark;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    title: "Selamat Datang di Website Resmi Desa Bogem",
    subtitle: "Kecamatan Kawedanan, Kabupaten Magetan",
    description: "Pusat informasi publik terpadu, transparansi tata kelola pemerintahan desa, layanan administrasi surat online, dan etalase promosi karya UMKM warga.",
    badge: "Pemerintah Desa Bogem",
    icon: Landmark,
  },
  {
    title: "Tata Kelola Pemerintahan & Pelayanan Prima",
    subtitle: "Inklusif, Cepat & Melayani Sepenuh Hati",
    description: "Mewujudkan pelayanan masyarakat yang transparan, profesional, dan akuntabel didukung digitalisasi layanan persuratan warga.",
    badge: "SOTK & Aparatur Desa",
    icon: Users,
  },
  {
    title: "Potensi Desa & Produk Unggulan UMKM",
    subtitle: "Dukung Produk Buatan Warga Lokal",
    description: "Temukan beragam hasil bumi, kerajinan tangan khas, serta olahan kuliner berkualitas langsung dari para perajin dan pelaku usaha desa.",
    badge: "Etalase Beli Dari Desa",
    icon: ShoppingBag,
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
      if (typeof document !== "undefined" && document.hidden) return;
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <section
      className="relative overflow-hidden bg-[#073623] text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Main Hero Content */}
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm">
              <SlideIcon className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
              <span>{slide.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {slide.title}
            </h1>

            <p className="text-emerald-200 font-medium text-sm sm:text-base lg:text-lg">
              {slide.subtitle}
            </p>

            <p className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
              <Link
                href="/layanan-surat"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-[#063321] hover:bg-emerald-50 font-bold py-3 px-6 rounded-xl shadow-md transition-all text-xs sm:text-sm active:scale-95"
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Ajukan Surat Online</span>
              </Link>
              <Link
                href="/potensi"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-800/70 hover:bg-emerald-800 text-white border border-emerald-600/50 font-semibold py-3 px-6 rounded-xl transition-all text-xs sm:text-sm active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Produk UMKM Desa</span>
              </Link>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="flex lg:flex-col items-center justify-center gap-3 pt-2 lg:pt-0">
            <div className="flex items-center space-x-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-7 bg-emerald-300" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
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
