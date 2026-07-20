"use client";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface MediaSlotProps {
  /** CDN URL for the image — drop in your real asset here */
  src?: string;
  poster?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Aspect ratio class — defaults to 16/9 */
  aspectClass?: string;
  /** When true, shows a "click to preview" hint overlay */
  previewable?: boolean;
  /** Click handler — usually opens the lightbox */
  onPreview?: () => void;
}

/**
 * MediaSlot — dedicated structural slot for luxury farmhouse imagery.
 * Designers can swap `src` for a real CDN URL without touching layout.
 * Falls back to a branded cream placeholder when no src is supplied.
 *
 * Set `previewable` to show a "click to preview" hint and call
 * `onPreview` to open the lightbox.
 */
export function MediaSlot({
  src,
  poster,
  alt,
  className = "",
  style,
  aspectClass = "aspect-video",
  previewable = false,
  onPreview,
}: MediaSlotProps) {
  const Tag = previewable && onPreview ? "button" : "div";

  return (
    <Tag
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl bg-surface-high text-left",
        aspectClass,
        className,
        previewable && "cursor-zoom-in state-layer"
      )}
      style={style}
      role={previewable ? "button" : "img"}
      aria-label={alt}
      aria-haspopup={previewable ? "dialog" : undefined}
      onClick={previewable ? onPreview : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
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
          style={{ backgroundImage: `url(${poster})`, backgroundSize: "cover" }}
        />
      )}

      {/* Subtle ring for definition */}
      <div className="absolute inset-0 ring-1 ring-inset ring-outline-variant/30" />

      {/* Preview hint */}
      {previewable && (
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-surface-lowest/85 px-3 py-1.5 backdrop-blur-sm elevation-1">
            <span className="material-symbols-outlined text-base text-primary">
              zoom_in
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wide-luxe text-on-surface">
              Preview
            </span>
          </span>
        </div>
      )}
    </Tag>
  );
}
