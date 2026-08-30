"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWA = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`*${title}*\n\nBaca selengkapnya di Website Resmi Desa Bogem:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  return (
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
  );
}
