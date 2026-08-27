"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageWithSkeletonProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  aspectRatio?: string;
}

export default function ImageWithSkeleton({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative w-full h-full overflow-hidden bg-slate-100",
  fallbackIcon,
  aspectRatio,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${containerClassName} flex items-center justify-center bg-emerald-50/70 text-emerald-700`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {fallbackIcon || <ImageIcon className="w-8 h-8 opacity-40" />}
      </div>
    );
  }

  return (
    <div
      className={containerClassName}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Shimmer skeleton while image is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
