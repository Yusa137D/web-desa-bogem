"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  User,
  Home,
  ShoppingBag,
  PieChart,
  Award,
  FileText,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
    <header className="bg-[#063321] text-white sticky top-0 z-50 shadow-sm border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Brand Info */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-8 h-10 sm:w-10 sm:h-12 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/logo-magetan.png"
                alt="Logo Kabupaten Magetan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition leading-tight">
                Web Desa Bogem
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-300/80 font-normal">
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-sm"
                      : link.isHighlighted
                      ? "bg-emerald-700/60 text-emerald-100 hover:bg-emerald-700 hover:text-white border border-emerald-500/30"
                      : "text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* User Profile Pill on Desktop */}
            <div className="pl-3 border-l border-emerald-800/60 ml-2">
              {user ? (
                <div className="flex items-center space-x-2 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-800/70 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white max-w-[100px] truncate leading-tight">{user.name}</span>
                    <span className="text-[9px] text-emerald-300 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="text-emerald-400 hover:text-rose-300 p-1 transition"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile & Tablet 2-Line Animated Hamburger Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-xl text-xs">
                <span className="font-bold text-emerald-200 text-[11px] max-w-[80px] truncate">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none select-none active:scale-90 transition-transform duration-200"
              aria-label="Toggle Navigation"
            >
              {/* Line 1 (Top) */}
              <span
                className={`w-5 h-[2px] bg-emerald-100 rounded-full transition-transform duration-300 ease-in-out origin-center ${
                  isOpen ? "translate-y-[4px] rotate-45 bg-white" : ""
                }`}
              />
              {/* Line 2 (Bottom) */}
              <span
                className={`w-5 h-[2px] bg-emerald-100 rounded-full transition-transform duration-300 ease-in-out origin-center ${
                  isOpen ? "-translate-y-[4px] -rotate-45 bg-white" : ""
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (Borderless, Smooth Flow) */}
      {isOpen && (
        <div className="lg:hidden bg-[#063321] px-4 pt-2 pb-6 space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300 ease-out shadow-lg">
          
          {/* Mobile User Profile Header */}
          {user ? (
            <div className="bg-emerald-950/50 p-3.5 rounded-2xl flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white block">{user.name}</span>
                  <span className="text-[11px] text-emerald-300/90">
                    {user.nik ? `NIK: ${user.nik}` : user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-4 h-4 text-emerald-200" />
                <span>Masuk Akun</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <User className="w-4 h-4 text-emerald-300" />
                <span>Daftar Akun</span>
              </Link>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-800 text-white font-semibold"
                    : link.isHighlighted
                    ? "bg-emerald-700/60 text-white font-semibold hover:bg-emerald-700"
                    : "text-emerald-100/90 hover:text-white hover:bg-emerald-800/40"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-300" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}