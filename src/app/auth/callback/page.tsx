"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    async function handleAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth callback error:", error);
          router.push(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (data.session) {
          router.push(redirectPath);
        } else {
          // Listen once for state change
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              router.push(redirectPath);
            }
          });

          // Timeout fallback
          setTimeout(() => {
            router.push(redirectPath);
          }, 2000);

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error("Callback exception:", err);
        router.push(redirectPath);
      }
    }

    handleAuth();
  }, [router, redirectPath]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#004329] flex items-center justify-center shadow-inner border border-emerald-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Menghubungkan Akun Google...</h2>
        <p className="text-xs text-slate-500">Mohon tunggu sebentar, kami sedang menyiapkan sesi Anda.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
