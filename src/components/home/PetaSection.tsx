"use client";

import { useEffect, useState } from "react";
import { Map as MapIcon, Clock, Building2, Phone, Mail } from "lucide-react";
import VillageMap from "@/components/VillageMap";
import { fetchProfilDesa, defaultProfilDesa } from "@/services/profilService";
import { ProfilDesaData } from "@/types/profil";

export default function PetaSection() {
  const [profil, setProfil] = useState<ProfilDesaData>(defaultProfilDesa);

  useEffect(() => {
    fetchProfilDesa().then((data) => {
      if (data) setProfil(data);
    }).catch(() => {});
  }, []);

  const rawPhone = profil.telepon_kantor || "+62 812-3456-7890";
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 space-y-6 sm:space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <MapIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Lokasi & Pelayanan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Peta Wilayah & Kantor Desa Bogem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kecamatan Kawedanan, Kabupaten Magetan, Jawa Timur
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/80 self-start sm:self-auto">
            <Clock className="w-4 h-4 flex-shrink-0 text-emerald-700" />
            <span>Jam Layanan: {profil.jam_pelayanan || "Senin - Jumat (08.00 - 15.00 WIB)"}</span>
          </div>
        </div>

        {/* Map and Office Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8">
            <VillageMap />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Alamat Kantor Desa</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {profil.alamat_kantor || "Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kabupaten Magetan, Jawa Timur 63382"}
              </p>
            </div>

            <div className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Kontak & Layanan Warga</h3>
              <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
                <p>
                  Email:{" "}
                  <a href={`mailto:${profil.email_kantor || "info@desabogem.id"}`} className="font-semibold text-emerald-800 hover:underline">
                    {profil.email_kantor || "info@desabogem.id"}
                  </a>
                </p>
                <p>
                  Telepon / WhatsApp:{" "}
                  <a href={`tel:${cleanPhone}`} className="font-semibold text-emerald-800 hover:underline">
                    {rawPhone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
