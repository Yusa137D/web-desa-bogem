"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

interface OtpCodeInputProps {
  email: string;
  onComplete: (code: string) => void;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
  disabled?: boolean;
}

export default function OtpCodeInput({
  email,
  onComplete,
  onResend,
  loading = false,
  disabled = false,
}: OtpCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");

    // Handle single digit input
    if (cleanValue.length <= 1) {
      const newDigits = [...digits];
      newDigits[index] = cleanValue;
      setDigits(newDigits);

      // Auto advance to next input
      if (cleanValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // If all 6 digits filled, trigger onComplete
      if (cleanValue && index === 5 && newDigits.every((d) => d !== "")) {
        onComplete(newDigits.join(""));
      } else if (newDigits.every((d) => d !== "")) {
        onComplete(newDigits.join(""));
      }
      return;
    }

    // Handle paste of multiple digits into a single box
    if (cleanValue.length >= 6) {
      const pastedDigits = cleanValue.slice(0, 6).split("");
      setDigits(pastedDigits);
      inputRefs.current[5]?.focus();
      onComplete(pastedDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6 && i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (newDigits.every((d) => d !== "")) {
      onComplete(newDigits.join(""));
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setResendMessage("");

    try {
      const res = await onResend();
      if (res.success) {
        setCountdown(60);
        setResendMessage("✓ Kode OTP baru telah dikirimkan ke email Anda.");
      } else {
        setResendMessage(res.error || "Gagal mengirim ulang kode OTP.");
      }
    } catch {
      setResendMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 6 Digit Input Boxes */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={digit}
            disabled={disabled || loading}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border-2 transition-all outline-none ${
              digit
                ? "border-[#004329] bg-emerald-50/50 text-[#004329] shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#004329] focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            } disabled:opacity-50`}
          />
        ))}
      </div>

      {resendMessage && (
        <p className={`text-xs text-center font-medium ${
          resendMessage.startsWith("✓") ? "text-emerald-700" : "text-rose-600"
        }`}>
          {resendMessage}
        </p>
      )}

      {/* Resend Action */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending || disabled || loading}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-[#004329] disabled:text-slate-400 disabled:cursor-not-allowed transition"
        >
          {isResending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Mengirim Ulang Kode...</span>
            </>
          ) : countdown > 0 ? (
            <span>Kirim ulang kode dalam <strong className="text-emerald-800 font-mono">{countdown}s</strong></span>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[#004329] underline decoration-emerald-500 font-bold">Kirim Ulang Kode OTP</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
