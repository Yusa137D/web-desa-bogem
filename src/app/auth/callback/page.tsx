"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/layanan-surat";
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    let timeoutId: NodeJS.Timeout | null = null;
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
        authListenerSubscription = null;
      }
    };

    const handleRedirectForUser = async (user: any) => {
      cleanup();
      if (!user) {
        router.replace(`/login?error=${encodeURIComponent("Sesi login tidak valid. Silakan coba masuk kembali.")}`);
        return;
      }

      try {
        // Query database to check if this citizen profile already has a valid 16-digit NIK and phone
        let hasNik = false;
        let hasPhone = false;

        if (supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.role === "admin") {
            router.replace("/admin");
            return;
          }

          const currentNik = profile?.nik || user.user_metadata?.nik || "";
          const currentPhone = profile?.no_hp || profile?.phone || user.user_metadata?.phone || user.user_metadata?.no_hp || "";

          hasNik = Boolean(currentNik && /^[0-9]{16}$/.test(currentNik.trim()));
          hasPhone = Boolean(currentPhone && currentPhone.trim().length >= 9);
        }

        // If profile is missing NIK or phone, send them to complete profile onboarding
        if (!hasNik || !hasPhone) {
          router.replace(`/lengkapi-profil?redirect=${encodeURIComponent(redirectPath)}`);
        } else {
          router.replace(redirectPath);
        }
      } catch (err) {
        console.warn("Could not check user profile in callback:", err);
        router.replace(`/lengkapi-profil?redirect=${encodeURIComponent(redirectPath)}`);
      }
    };

    async function processAuthCallback() {
      // 1. Check if OAuth provider returned an error in URL
      const urlError = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      if (urlError || errorDescription) {
        cleanup();
        const msg = errorDescription || urlError || "Gagal masuk atau verifikasi akun.";
        router.replace(`/login?error=${encodeURIComponent(msg)}`);
        return;
      }

      if (!supabase) {
        cleanup();
        router.replace(`/login?error=${encodeURIComponent("Layanan autentikasi database belum siap.")}`);
        return;
      }

      // 2. PKCE Authorization Code Exchange
      const code = searchParams.get("code");
      if (code) {
        try {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("exchangeCodeForSession error:", exchangeError);
            cleanup();
            router.replace(`/login?error=${encodeURIComponent("Gagal verifikasi sesi: " + exchangeError.message)}`);
            return;
          }

          if (exchangeData?.user) {
            await handleRedirectForUser(exchangeData.user);
            return;
          }
        } catch (ex) {
          console.warn("Code exchange exception:", ex);
        }
      }

      // 3. Check existing session if already established
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await handleRedirectForUser(sessionData.session.user);
          return;
        }
      } catch (err) {
        console.warn("getSession error in callback:", err);
      }

      // 4. Listen for auth state change (e.g. implicit hash token parsing)
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await handleRedirectForUser(session.user);
        }
      });
      authListenerSubscription = authListener.subscription;

      // 5. Safe timeout fallback: if auth cannot resolve in 4 seconds, send back to login with friendly error
      timeoutId = setTimeout(() => {
        cleanup();
        router.replace(`/login?error=${encodeURIComponent("Waktu verifikasi sesi habis. Silakan coba masuk kembali.")}`);
      }, 4000);
    }

    processAuthCallback();

    return () => {
      cleanup();
    };
  }, [router, redirectPath, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#004329] flex items-center justify-center shadow-inner border border-emerald-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Memverifikasi Akun Warga...</h2>
        <p className="text-xs text-slate-500">Mohon tunggu sebentar, kami sedang memverifikasi sesi login & email Anda.</p>
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
