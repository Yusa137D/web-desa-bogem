import Link from "next/link";
import {
  UserCheck,
  Users,
  PieChart,
  ShoppingBag,
  Newspaper,
  FileText,
  LucideIcon,
} from "lucide-react";

interface ShortcutItem {
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  isSpecial?: boolean;
}

const QUICK_SHORTCUTS: ShortcutItem[] = [
  {
    title: "Layanan Surat",
    desc: "Pengajuan Online",
    href: "/layanan-surat",
    icon: FileText,
    isSpecial: true,
  },
  {
    title: "Profil Desa",
    desc: "Sejarah & Wilayah",
    href: "/profil",
    icon: UserCheck,
  },
  {
    title: "Struktur SOTK",
    desc: "Aparatur Desa",
    href: "/pemerintah",
    icon: Users,
  },
  {
    title: "Infografis",
    desc: "Data & APBDes",
    href: "/infografis",
    icon: PieChart,
  },
  {
    title: "Beli Dari Desa",
    desc: "Etalase UMKM",
    href: "/potensi",
    icon: ShoppingBag,
  },
  {
    title: "Kabar Berita",
    desc: "Warta Terkini",
    href: "/berita",
    icon: Newspaper,
  },
];

export default function QuickShortcuts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-12 sm:mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {QUICK_SHORTCUTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 group flex flex-col items-center text-center space-y-2 active:scale-95 shadow-sm hover:shadow-md ${
                item.isSpecial
                  ? "bg-emerald-800 text-white border border-emerald-700 hover:bg-emerald-900"
                  : "bg-white border border-slate-200/90 hover:border-emerald-500/40 hover:bg-slate-50/50"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                  item.isSpecial
                    ? "bg-emerald-700/80 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 w-full">
                <h2
                  className={`text-xs font-bold truncate ${
                    item.isSpecial ? "text-white" : "text-slate-900 group-hover:text-emerald-800"
                  }`}
                >
                  {item.title}
                </h2>
                <p
                  className={`text-[10px] font-normal truncate mt-0.5 ${
                    item.isSpecial ? "text-emerald-200" : "text-slate-500"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
