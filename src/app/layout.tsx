import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Desa Bogem | Kec. Kawedanan, Kab. Magetan",
  description: "Website Resmi Pemerintah Desa Bogem, Kecamatan Kawedanan, Kabupaten Magetan - Layanan Informasi Publik & UMKM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col antialiased text-slate-800`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}