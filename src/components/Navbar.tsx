"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  User,
  Home,
  Menu,
  X,
  ShoppingBag,
  PieChart,
  Award,
  FileText,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide public navbar inside admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Profil Desa", href: "/profil", icon: User },
    { name: "Infografis", href: "/infografis", icon: PieChart },
    { name: "Status IDM", href: "/infografis/idm", icon: Award },
    { name: "Kabar Berita", href: "/berita", icon: Newspaper },
    { name: "Potensi & Belanja", href: "/potensi", icon: ShoppingBag },
    { name: "Layanan Surat", href: "/layanan-surat", icon: FileText, isHighlighted: true },
  ];

  return (
    <header className="bg-[#00321F] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Brand Info */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="relative w-8 h-10 sm:w-10 sm:h-12 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/logo-magetan.png"
                alt="Logo Kabupaten Magetan"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-200 transition leading-tight">
                Web Desa Bogem
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-200/90 font-medium">
                Kec. Kawedanan, Kab. Magetan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-700/80 text-white shadow-inner"
                      : link.isHighlighted
                      ? "bg-emerald-600/40 text-emerald-200 hover:bg-emerald-600 hover:text-white border border-emerald-400/30"
                      : "text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile & Tablet Hamburger Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 focus:outline-none active:scale-95 transition"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#002819] border-t border-emerald-800/60 px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-700 text-white font-semibold"
                    : link.isHighlighted
                    ? "bg-emerald-800/70 text-emerald-200 font-bold border border-emerald-400/30"
                    : "text-emerald-100 hover:bg-emerald-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}