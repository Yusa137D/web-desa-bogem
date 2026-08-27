"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Newspaper, User, FileText } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  // Hide public mobile nav inside admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Profil", href: "/profil", icon: User },
    { name: "Berita", href: "/berita", icon: Newspaper },
    { name: "Belanja", href: "/potensi", icon: ShoppingBag },
    { name: "Surat", href: "/layanan-surat", icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#002B1B]/95 backdrop-blur-md border-t border-emerald-800/80 px-2 py-2 pb-safe shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-emerald-300 font-bold"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-emerald-800/60" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
