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

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[#05281a]/95 backdrop-blur-md border-t border-emerald-900/60 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xl touch-manipulation select-none"
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={(e) => handleNavClick(item.href, e)}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? "text-emerald-300 font-bold"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-emerald-800/80 shadow-sm" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.25]" : "stroke-[1.75]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
