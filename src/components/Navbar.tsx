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
  LogIn,
  LogOut,
  ShieldCheck,
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
                Desa Bogem
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

            {/* User Profile Pill on Desktop */}
            <div className="pl-2 border-l border-emerald-800/80">
              {user ? (
                <div className="flex items-center space-x-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white max-w-[110px] truncate leading-tight">{user.name}</span>
                    <span className="text-[9px] text-emerald-300 font-semibold">
                      {user.role === "admin" ? "Pengelola Desa" : "Warga Desa"}
                    </span>
                  </div>
                  {!user.isProfileComplete && (
                    <Link
                      href="/lengkapi-profil"
                      className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md font-bold hover:bg-amber-500/30 transition"
                      title="Lengkapi NIK KTP Anda"
                    >
                      Lengkapi NIK
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-emerald-400 hover:text-rose-300 p-1 transition ml-1"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 bg-emerald-600/30 hover:bg-emerald-600 hover:text-white text-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/40"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile & Tablet Hamburger Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/80 text-xs">
                <span className="font-bold text-emerald-200 text-[11px] max-w-[80px] truncate">{user.name}</span>
              </div>
            )}
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
        <div className="lg:hidden bg-[#002819] border-t border-emerald-800/60 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          
          {/* Mobile User Profile Header */}
          {user ? (
            <div className="bg-[#003823] p-3.5 rounded-2xl border border-emerald-800/80 mb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-[#004329] text-white flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-[11px] text-emerald-300 font-mono">
                      {user.nik ? `NIK: ${user.nik}` : user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-800/60 transition flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>

              {!user.isProfileComplete && (
                <Link
                  href="/lengkapi-profil"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <span>⚠️ Profil Belum Lengkap — Isi NIK KTP</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="bg-[#004329] text-white text-center py-2.5 rounded-xl text-xs font-bold border border-emerald-600/40 flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-4 h-4 text-emerald-300" />
                <span>Masuk Akun</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-950/60 text-emerald-200 text-center py-2.5 rounded-xl text-xs font-bold border border-emerald-700/60 flex items-center justify-center space-x-1.5"
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