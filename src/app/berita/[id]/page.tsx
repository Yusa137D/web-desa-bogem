import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchBeritaById, fetchBeritaList } from "@/services/beritaService";
import { formatDateIndonesian } from "@/utils/formatters";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Newspaper,
  ArrowRight,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import ShareButtons from "@/components/berita/ShareButtons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60; // Cache individual article for 60 seconds

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const berita = await fetchBeritaById(id);

  if (!berita) {
    return {
      title: "Warta Tidak Ditemukan | Desa Bogem",
      description: "Artikel warta atau pengumuman desa tidak ditemukan.",
    };
  }

  const cleanDescription = berita.ringkasan || berita.konten.slice(0, 160).replace(/\n/g, " ");

  return {
    title: `${berita.judul} | Desa Bogem`,
    description: cleanDescription,
    openGraph: {
      title: berita.judul,
      description: cleanDescription,
      type: "article",
      publishedTime: berita.created_at,
      authors: [berita.penulis || "Pemerintah Desa Bogem"],
      images: berita.gambar ? [{ url: berita.gambar, alt: berita.judul }] : [],
    },
  };
}

export default async function DetailBeritaPage({ params }: PageProps) {
  const { id } = await params;
  const [berita, allNews] = await Promise.all([
    fetchBeritaById(id),
    fetchBeritaList(),
  ]);

  if (!berita) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
            <Newspaper className="w-7 h-7 text-emerald-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Warta Tidak Ditemukan</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Berita atau pengumuman yang Anda cari mungkin telah diperbarui, dipindahkan, atau belum dipublikasikan.
          </p>
          <div className="pt-2">
            <Link
              href="/berita"
              className="inline-flex items-center space-x-2 bg-[#063321] hover:bg-[#073d28] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Berita</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const otherNews = allNews
    .filter((item) => String(item.id) !== String(id))
    .slice(0, 3);

  // Calculate estimated reading time
  const wordCount = (berita.konten || "").split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const paragraphs = berita.konten
    ? berita.konten.split("\n").filter((p) => p.trim() !== "")
    : [];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/" className="hover:text-emerald-800 transition">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Link href="/berita" className="hover:text-emerald-800 transition">
            Kabar Berita
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
            {berita.judul}
          </span>
        </nav>

        {/* Back Link Button */}
        <div>
          <Link
            href="/berita"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-emerald-800 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Berita</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-slate-200/80 space-y-6">
          {/* Header & Meta */}
          <header className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                <Tag className="w-3 h-3 text-emerald-700" />
                <span>{berita.kategori || "Pengumuman Resmi"}</span>
              </span>

              <span className="inline-flex items-center space-x-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTimeMinutes} menit baca</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
              {berita.judul}
            </h1>

            {/* Author & Publish Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100">
                  <User className="w-4 h-4 text-emerald-700" />
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
              <ShareButtons title={berita.judul} />
            </div>
          </header>

          {/* Banner Photo */}
          {berita.gambar && (
            <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <Image
                src={berita.gambar}
                alt={berita.judul}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Lead Summary (if present) */}
          {berita.ringkasan && (
            <div className="bg-emerald-50/60 border-l-2 border-emerald-600 p-4 sm:p-5 rounded-r-2xl text-slate-700 text-sm sm:text-base font-medium italic leading-relaxed">
              &ldquo;{berita.ringkasan}&rdquo;
            </div>
          )}

          {/* Article Full Body */}
          <div className="space-y-4 sm:space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed sm:leading-loose">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="text-justify sm:text-left font-normal">
                {p}
              </p>
            ))}
          </div>

          {/* Footer of Article */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Kategori: <strong className="text-slate-800">{berita.kategori || "Pengumuman Resmi"}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Bagikan Warta Ini:</span>
              <ShareButtons title={berita.judul} />
            </div>
          </div>
        </article>

        {/* Other Latest News Section */}
        {otherNews.length > 0 && (
          <section className="space-y-4 sm:space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Warta & Berita Desa Lainnya
                </h2>
              </div>
              <Link
                href="/berita"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition hover:underline flex items-center space-x-1"
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
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-3">
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                      {item.gambar ? (
                        <Image
                          src={item.gambar}
                          alt={item.judul}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 300px"
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
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-2 leading-snug">
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
