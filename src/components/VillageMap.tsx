"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, ExternalLink, Compass, Layers } from "lucide-react";

interface MapLocationData {
  villageName: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  address: string;
  googleMapsUrl: string;
  embedUrl: string;
}

export default function VillageMap() {
  const [mapData, setMapData] = useState<MapLocationData | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await fetch("/api/maps");
        const json = await res.json();
        if (json.success && json.data) {
          setMapData(json.data);
        }
      } catch (err) {
        console.error("Failed to load map data from API:", err);
      }
    }

    loadMapData();
  }, []);

  const defaultEmbed =
    "https://maps.google.com/maps?q=Kantor+Desa+Bogem+Kawedanan+Magetan&t=&z=16&ie=UTF8&iwloc=&output=embed";
  const defaultGoogleUrl =
    "https://www.google.com/maps/search/?api=1&query=Kantor+Desa+Bogem+Kawedanan+Magetan";

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>Peta Presisi Wilayah</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">
            Lokasi Kantor Desa Bogem
          </h2>
          <p className="text-xs text-slate-500">
            {mapData?.address || "Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan, Jawa Timur 63382"}
          </p>
        </div>

        {/* CTA Button */}
        <a
          href={mapData?.googleMapsUrl || defaultGoogleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition shadow-sm group active:scale-95 self-start sm:self-auto"
        >
          <Navigation className="w-4 h-4 text-emerald-300 group-hover:rotate-45 transition-transform" />
          <span>Petunjuk Arah</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Interactive Map Iframe Container with Lazy-Loading Observer */}
      <div
        ref={mapContainerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 flex items-center justify-center"
      >
        {isIframeLoaded ? (
          <iframe
            title="Peta Lokasi Kantor Desa Bogem Kawedanan Magetan"
            src={mapData?.embedUrl || defaultEmbed}
            className="w-full h-full border-0 animate-in fade-in duration-500"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Memuat Peta Interaktif...</span>
            <button
              onClick={() => setIsIframeLoaded(true)}
              className="text-xs text-emerald-800 font-bold underline"
            >
              Klik untuk tampilkan segera
            </button>
          </div>
        )}

        {/* Floating Location Tag Badge */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur border border-slate-200/80 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg flex items-center space-x-2.5 text-xs max-w-[85%] sm:max-w-none">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="truncate">
            <div className="font-bold text-slate-900 truncate">Kantor Desa Bogem</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Kec. Kawedanan, Kab. Magetan</div>
          </div>
        </div>
      </div>

      {/* Detail Location Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs pt-1">
        <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Alamat Utama</span>
          <span className="font-bold text-slate-800 text-[11px] sm:text-xs">Jl. Bakti Mulya No. 241</span>
        </div>
        <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Kecamatan</span>
          <span className="font-bold text-slate-800 text-[11px] sm:text-xs">Kawedanan</span>
        </div>
        <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Kabupaten</span>
          <span className="font-bold text-slate-800 text-[11px] sm:text-xs">Magetan</span>
        </div>
        <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Kode Pos</span>
          <span className="font-bold text-slate-800 text-[11px] sm:text-xs">63382</span>
        </div>
      </div>

    </div>
  );
}
