"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageTransitionBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route finishes changing, smoothly complete the progress bar
    setLoading(true);
    setProgress(100);

    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Global click listener on internal Next.js links to start progress bar instantly
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.hasAttribute("download") &&
        link.target !== "_blank" &&
        link.pathname !== window.location.pathname
      ) {
        setLoading(true);
        setProgress(35);

        setTimeout(() => {
          setProgress((prev) => (prev < 80 ? 80 : prev));
        }, 150);
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10000] h-[3px] bg-transparent pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
