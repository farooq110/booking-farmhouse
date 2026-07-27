"use client";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/lib/images";

export interface MediaSlotProps {
  src?: string | { src: string; width: number; height: number; blurDataURL?: string };
  poster?: string | { src: string; width: number; height: number; blurDataURL?: string };
  alt: string;
  className?: string;
  style?: CSSProperties;
  aspectClass?: string;
  previewable?: boolean;
  onPreview?: () => void;
}

function asUrl(
  v?: string | { src: string; width: number; height: number; blurDataURL?: string }
): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v.src;
}

export function MediaSlot({
  src, poster, alt, className = "", style,
  aspectClass = "aspect-video", previewable = false, onPreview,
}: MediaSlotProps) {
  const Tag = previewable && onPreview ? "button" : "div";
  return (
    <Tag
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl bg-surface-high text-left",
        aspectClass, className, previewable && "cursor-zoom-in state-layer"
      )}
      style={style}
      role={previewable ? "button" : "img"}
      aria-label={alt}
      aria-haspopup={previewable ? "dialog" : undefined}
      onClick={previewable ? onPreview : undefined}
    >
      {src ? (
        <OptimizedImage
          src={src} alt={alt} fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0 grain-overlay">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 via-transparent to-tertiary-container/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
              photo_camera
            </span>
          </div>
        </div>
      )}
      {poster && (
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${asUrl(poster)})`, backgroundSize: "cover" }}
        />
      )}
      <div className="absolute inset-0 ring-1 ring-inset ring-outline-variant/30" />
      {previewable && (
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-surface-lowest/85 px-3 py-1.5 backdrop-blur-sm elevation-1">
            <span className="material-symbols-outlined text-base text-primary">zoom_in</span>
            <span className="font-sans text-[10px] uppercase tracking-wide-luxe text-on-surface">
              Preview
            </span>
          </span>
        </div>
      )}
    </Tag>
  );
}
