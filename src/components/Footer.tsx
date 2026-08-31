"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Clock, MapPin, Heart } from "lucide-react";
import { getLocalProfil, fetchProfilDesa, defaultProfilDesa } from "@/services/profilService";
import { ProfilDesaData } from "@/types/profil";

export default function Footer() {
  const pathname = usePathname();
  const [profil, setProfil] = useState<ProfilDesaData>(defaultProfilDesa);

  useEffect(() => {
    // 1. Initial local cached data
    const local = getLocalProfil();
    if (local) setProfil(local);

    // 2. Fetch latest data from database
    fetchProfilDesa().then((data) => {
      if (data) setProfil(data);
    });

    // 3. Listen to local storage & custom updates
    const handleUpdate = () => {
      setProfil(getLocalProfil());
    };

    window.addEventListener("local_profil_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_profil_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Hide public footer inside admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const rawPhone = profil.telepon_kantor || "+62 812-3456-7890";
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

  return (
    <footer className="bg-[#002517] text-emerald-100 border-t border-emerald-900/60 pb-28 md:pb-8 pt-12">
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
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Desa Bogem</h3>
                <p className="text-xs text-emerald-300/90">Kec. Kawedanan, Kab. Magetan</p>
              </div>
            </div>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Website Resmi Layanan Informasi Publik & Promosi Produk UMKM Warga Desa Bogem.
            </p>
          </div>

          {/* Column 2: Kontak Kantor Desa */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">Kontak Kantor Desa</h4>
            <ul className="space-y-2.5 text-sm text-emerald-200/90">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{profil.alamat_kantor || "Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan"}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-emerald-300 transition">
                  {rawPhone}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`mailto:${profil.email_kantor || "info@desabogem.id"}`} className="hover:text-emerald-300 transition">
                  {profil.email_kantor || "info@desabogem.id"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Jam Pelayanan */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">Jam Pelayanan Kantor</h4>
            <div className="space-y-2 text-sm text-emerald-200/90">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{profil.jam_pelayanan || "Senin - Jumat: 08.00 - 15.00 WIB"}</span>
              </div>
              {profil.jam_pelayanan_note && (
                <div className="flex items-center space-x-2 text-emerald-400/70 text-xs mt-2">
                  <span>{profil.jam_pelayanan_note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Navigasi Halaman */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">Navigasi Halaman</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-300 transition">Beranda</Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-emerald-300 transition">Profil Desa</Link>
              </li>
              <li>
                <Link href="/pemerintah" className="hover:text-emerald-300 transition">Pemerintah & SOTK</Link>
              </li>
              <li>
                <Link href="/infografis" className="hover:text-emerald-300 transition">Infografis & IDM</Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-emerald-300 transition">Kabar Berita</Link>
              </li>
              <li>
                <Link href="/potensi" className="hover:text-emerald-300 transition font-medium text-emerald-300">Beli dari Desa (UMKM)</Link>
              </li>
              <li>
                <Link href="/layanan-surat" className="hover:text-emerald-300 transition font-bold text-emerald-300">Layanan Surat Online</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-emerald-900/60 flex flex-col md:flex-row items-center justify-between text-xs text-emerald-400/80 gap-2">
          <p>© {new Date().getFullYear()} Pemerintah Desa Bogem, Magetan. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Dibuat untuk Kemajuan Desa</span>
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
