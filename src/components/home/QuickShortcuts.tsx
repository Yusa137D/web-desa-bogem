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
  color: string;
  isSpecial?: boolean;
}

const QUICK_SHORTCUTS: ShortcutItem[] = [
  {
    title: "Layanan Surat",
    desc: "Pengajuan Online",
    href: "/layanan-surat",
    icon: FileText,
    color: "bg-emerald-600 text-white border-emerald-500",
    isSpecial: true,
  },
  {
    title: "Profil Desa",
    desc: "Sejarah & Wilayah",
    href: "/profil",
    icon: UserCheck,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    title: "Struktur SOTK",
    desc: "Aparatur Desa",
    href: "#sotk",
    icon: Users,
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    title: "Infografis Warga",
    desc: "Data Kependudukan",
    href: "/infografis",
    icon: PieChart,
    color: "bg-cyan-50 text-cyan-800 border-cyan-200",
  },
  {
    title: "Beli Dari Desa",
    desc: "Etalase UMKM",
    href: "/potensi",
    icon: ShoppingBag,
    color: "bg-lime-50 text-lime-900 border-lime-200",
  },
  {
    title: "Kabar Berita",
    desc: "Warta Terkini",
    href: "/berita",
    icon: Newspaper,
    color: "bg-blue-50 text-blue-900 border-blue-200",
  },
];

export default function QuickShortcuts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-12 sm:mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {QUICK_SHORTCUTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-lg border transition-all duration-300 group flex flex-col items-center text-center space-y-2 active:scale-95 ${
                item.isSpecial
                  ? "bg-gradient-to-b from-emerald-50 to-white border-emerald-400 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200/80 hover:border-emerald-400"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-110 transition-transform shadow-sm`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 w-full">
                <h2 className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-800 transition truncate">
                  {item.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium truncate">
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
