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

    async function handleAuth() {
      // 1. Check if OAuth provider returned an error in the query parameters
      const urlError = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      if (urlError || errorDescription) {
        console.error("OAuth error returned from provider:", urlError, errorDescription);
        const errorMsg = errorDescription || urlError || "Gagal masuk dengan akun Google.";
        router.replace(`/login?error=${encodeURIComponent(errorMsg)}`);
        return;
      }

      // 2. Check if an authorization code was returned (PKCE Flow)
      const code = searchParams.get("code");
      if (code && supabase) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("exchangeCodeForSession error:", exchangeError);
            router.replace(`/login?error=${encodeURIComponent("Gagal verifikasi sesi Google: " + exchangeError.message)}`);
            return;
          }
        } catch (exchangeEx) {
          console.warn("exchangeCodeForSession exception:", exchangeEx);
        }
      }

      // 3. Inspect session and user profile completeness
      const checkSessionAndRedirect = async (user: any) => {
        if (!user) return false;

        try {
          // Check public.profiles table for registered 16-digit NIK and valid phone number
          const { data: profile } = await supabase
            .from("profiles")
            .select("nik, phone, no_hp")
            .eq("id", user.id)
            .maybeSingle();

          const userMeta = user.user_metadata || {};
          const nik = profile?.nik || userMeta.nik || "";
          const phone = profile?.no_hp || profile?.phone || userMeta.phone || userMeta.no_hp || "";

          const hasValidNik = Boolean(nik && /^[0-9]{16}$/.test(nik.trim()));
          const hasValidPhone = Boolean(phone && phone.trim().length >= 9);

          if (!hasValidNik || !hasValidPhone) {
            router.replace(`/lengkapi-profil?redirect=${encodeURIComponent(redirectPath)}`);
          } else {
            router.replace(redirectPath);
          }
          return true;
        } catch (profileErr) {
          console.warn("Could not check profile completeness:", profileErr);
          router.replace(redirectPath);
          return true;
        }
      };

      try {
        if (!supabase) {
          router.replace(redirectPath);
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await checkSessionAndRedirect(sessionData.session.user);
          return;
        }

        // Listen for auth state change (e.g. hash token parsing)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await checkSessionAndRedirect(session.user);
          }
        });

        // Safe timeout fallback
        const timeout = setTimeout(() => {
          router.replace(redirectPath);
        }, 3000);

        return () => {
          clearTimeout(timeout);
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Auth callback exception:", err);
        router.replace(redirectPath);
      }
    }

    handleAuth();
  }, [router, redirectPath, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#004329] flex items-center justify-center shadow-inner border border-emerald-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Menghubungkan Akun Google...</h2>
        <p className="text-xs text-slate-500">Mohon tunggu sebentar, kami sedang memverifikasi sesi login Anda.</p>
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
