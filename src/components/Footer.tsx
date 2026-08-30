"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Clock, MapPin, Heart } from "lucide-react";
import { fetchProfilDesa, defaultProfilDesa } from "@/services/profilService";
import { ProfilDesaData } from "@/types/profil";

export default function Footer() {
  const pathname = usePathname();
  const [profil, setProfil] = useState<ProfilDesaData>(defaultProfilDesa);

  useEffect(() => {
    fetchProfilDesa().then((data) => {
      if (data) setProfil(data);
    }).catch(() => {});
  }, []);

  // Hide public footer inside admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const rawPhone = profil.telepon_kantor || "+62 812-3456-7890";
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

  return (
    <footer className="bg-[#05281a] text-emerald-100/90 border-t border-emerald-900/60 pb-28 md:pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Info Desa */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-12 flex-shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-magetan.png"
                  alt="Logo Kabupaten Magetan"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Web Desa Bogem</h3>
                <p className="text-xs text-emerald-300/90">Kec. Kawedanan, Kab. Magetan</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              Website Resmi Layanan Informasi Publik, Administrasi Persuratan & Promosi Produk UMKM Warga Desa Bogem.
            </p>
          </div>

          {/* Column 2: Kontak Kantor Desa */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-emerald-300">Kontak Kantor Desa</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-200/90">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{profil.alamat_kantor || "Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan"}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition">
                  {rawPhone}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`mailto:${profil.email_kantor || "info@desabogem.id"}`} className="hover:text-white transition">
                  {profil.email_kantor || "info@desabogem.id"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Jam Pelayanan */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-emerald-300">Jam Pelayanan Kantor</h4>
            <div className="space-y-2 text-xs sm:text-sm text-emerald-200/90">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{profil.jam_pelayanan || "Senin - Jumat: 08.00 - 15.00 WIB"}</span>
              </div>
              {profil.jam_pelayanan_note && (
                <div className="flex items-center space-x-2 text-emerald-400/80 text-xs mt-2">
                  <span>{profil.jam_pelayanan_note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Navigasi Halaman */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-emerald-300">Navigasi Cepat</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">Beranda</Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-white transition">Profil Desa</Link>
              </li>
              <li>
                <Link href="/pemerintah" className="hover:text-white transition">Pemerintah & SOTK</Link>
              </li>
              <li>
                <Link href="/infografis" className="hover:text-white transition">Infografis & IDM</Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-white transition">Kabar Berita</Link>
              </li>
              <li>
                <Link href="/potensi" className="hover:text-white transition font-medium text-emerald-300">Beli dari Desa (UMKM)</Link>
              </li>
              <li>
                <Link href="/layanan-surat" className="hover:text-white transition font-semibold text-emerald-300">Layanan Surat Online</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-emerald-900/60 flex flex-col md:flex-row items-center justify-between text-xs text-emerald-400/80 gap-2">
          <p>© {new Date().getFullYear()} Pemerintah Desa Bogem, Magetan. Hak Cipta Dilindungi.</p>
          <div className="flex items-center space-x-1">
            <span>Portal Resmi Layanan Masyarakat Desa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
