"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchBeritaById, fetchBeritaList } from "@/services/beritaService";
import { BeritaItem } from "@/types/berita";
import { formatDateIndonesian } from "@/utils/formatters";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Share2,
  Check,
  Clock,
  Newspaper,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function DetailBeritaPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Support both Promise params (Next.js 15+) and direct params
  const unwrappedParams = typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = unwrappedParams?.id;

  const [berita, setBerita] = useState<BeritaItem | null>(null);
  const [otherNews, setOtherNews] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [detail, allList] = await Promise.all([
          fetchBeritaById(id),
          fetchBeritaList(),
        ]);
        setBerita(detail);
        // Filter out current article from other news
        setOtherNews(allList.filter((item) => String(item.id) !== String(id)).slice(0, 3));
      } catch (err) {
        console.error("Error fetching detail berita:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWA = () => {
    if (typeof window !== "undefined" && berita) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`*${berita.judul}*\n\nBaca selengkapnya di Website Resmi Desa Bogem:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Memuat artikel berita desa...</p>
        </div>
      </main>
    );
  }

  if (!berita) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Newspaper className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Warta Tidak Ditemukan</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berita atau pengumuman yang Anda cari mungkin telah diperbarui, dipindahkan, atau belum dipublikasikan.
          </p>
          <div className="pt-2">
            <Link
              href="/berita"
              className="inline-flex items-center space-x-2 bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-5 rounded-xl transition text-xs shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Berita</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Calculate estimated reading time
  const wordCount = (berita.konten || "").split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Split content by paragraphs
  const paragraphs = berita.konten
    ? berita.konten.split("\n").filter((p) => p.trim() !== "")
    : [];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/" className="hover:text-[#004329] transition">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Link href="/berita" className="hover:text-[#004329] transition">
            Kabar Berita
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-md">
            {berita.judul}
          </span>
        </nav>

        {/* Back Link Button */}
        <div>
          <Link
            href="/berita"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-[#004329] border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Berita</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-slate-200/80 space-y-6 sm:space-y-8">
          
          {/* Header & Meta */}
          <header className="space-y-4 border-b border-slate-100 pb-6 sm:pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Tag className="w-3 h-3 text-emerald-700" />
                <span>{berita.kategori || "Pengumuman Resmi"}</span>
              </span>

              <span className="inline-flex items-center space-x-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTimeMinutes} menit baca</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {berita.judul}
            </h1>

            {/* Author & Publish Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#004329] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">
                    {berita.penulis || "Pemerintah Desa Bogem"}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateIndonesian(berita.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Share actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShareWA}
                  className="inline-flex items-center space-x-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95"
                  title="Bagikan ke WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95"
                  title="Salin Tautan Artikel"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin Link"}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Banner Photo */}
          {berita.gambar && (
            <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <img
                src={berita.gambar}
                alt={berita.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead Summary (if present) */}
          {berita.ringkasan && (
            <div className="bg-emerald-50/60 border-l-4 border-emerald-600 p-4 sm:p-5 rounded-r-2xl text-slate-700 text-sm sm:text-base font-medium italic leading-relaxed">
              "{berita.ringkasan}"
            </div>
          )}

          {/* Article Full Body */}
          <div className="space-y-4 sm:space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed sm:leading-loose">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="text-justify sm:text-left">
                {p}
              </p>
            ))}
          </div>

          {/* Footer of Article */}
          <div className="pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Kategori: <strong className="text-slate-800">{berita.kategori || "Pengumuman Resmi"}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Bagikan Warta Ini:</span>
              <button
                onClick={handleShareWA}
                className="p-2 bg-[#25D366] text-white rounded-xl hover:opacity-90 transition active:scale-95"
                title="Bagikan via WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition active:scale-95"
                title="Salin Tautan"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </article>

        {/* Other Latest News Section */}
        {otherNews.length > 0 && (
          <section className="space-y-4 sm:space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Warta & Berita Desa Lainnya
                </h2>
              </div>
              <Link
                href="/berita"
                className="text-xs font-bold text-[#004329] hover:underline flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {otherNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.id}`}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-3">
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                      {item.gambar ? (
                        <img
                          src={item.gambar}
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Newspaper className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {item.kategori || "Warta Desa"}
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#004329] transition line-clamp-2 leading-snug">
                        {item.judul}
                      </h3>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span>Baca Warta</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
