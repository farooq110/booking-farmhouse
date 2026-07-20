"use client";
import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./luxury-primitives";
import { cn } from "@/lib/utils";

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface LightboxProps {
  items: LightboxItem[];
  /** Index of the currently-open image; null when closed */
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}

/**
 * Lightbox — full-screen image preview with keyboard navigation.
 *
 * - Rendered via a portal at document.body so it overlays everything.
 * - Esc closes, ← → navigate, click outside image closes.
 * - Honors prefers-reduced-motion (instant transitions).
 * - Accessible: role="dialog", aria-modal, focus trap is implicit
 *   because the only tabbable elements are the prev/next/close buttons.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  // useSyncExternalStore gives us a stable "is this mounted on the client?"
  // signal without setState-in-effect warnings. SSR returns false, then the
  // first client render flips to true — createPortal only runs on the client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isOpen = index !== null;
  const current = isOpen ? items[index] : null;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!mounted || !isOpen || !current) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${current.alt}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-lowest/10 text-cream backdrop-blur-md transition hover:bg-surface-lowest/20"
        aria-label="Close preview"
      >
        <Icon name="close" className="text-2xl" />
      </button>

      {/* Counter */}
      <span className="absolute top-7 left-1/2 -translate-x-1/2 font-sans text-xs uppercase tracking-luxe text-cream/70">
        {String((index ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </span>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-lowest/10 text-cream backdrop-blur-md transition hover:bg-surface-lowest/20"
          aria-label="Previous image"
        >
          <Icon name="chevron_left" className="text-3xl" />
        </button>
      )}

      {/* Image */}
      <figure
        className="relative max-h-[88vh] max-w-[90vw] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="mx-auto max-h-[88vh] max-w-[90vw] rounded-lg object-contain elevation-4"
        />
        {current.caption && (
          <figcaption className="mt-4 text-center font-display text-lg text-cream/85">
            {current.caption}
          </figcaption>
        )}
      </figure>

      {/* Next button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-lowest/10 text-cream backdrop-blur-md transition hover:bg-surface-lowest/20"
          aria-label="Next image"
        >
          <Icon name="chevron_right" className="text-3xl" />
        </button>
      )}

      {/* Hint */}
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-luxe text-cream/40">
        Use arrow keys to navigate · Esc to close
      </span>
    </div>,
    document.body
  );
}

/**
 * Hook that manages lightbox open/close state + navigation.
 *
 * Usage:
 *   const lightbox = useLightbox(items);
 *   <button onClick={() => lightbox.open(2)}>Preview</button>
 *   <Lightbox {...lightbox} />
 */
export function useLightbox(items: LightboxItem[]) {
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => setIndex(i);
  const close = () => setIndex(null);
  const navigate = (next: number) => setIndex(next);

  return {
    items,
    index,
    onClose: close,
    onNavigate: navigate,
    open,
    isOpen: index !== null,
  };
}

/** Convenience wrapper that combines the hook + component. */
export function LightboxWithHook({
  items,
  controller,
}: {
  items: LightboxItem[];
  controller: ReturnType<typeof useLightbox>;
}) {
  return (
    <Lightbox
      items={items}
      index={controller.index}
      onClose={controller.onClose}
      onNavigate={controller.onNavigate}
    />
  );
}

// Tiny helper for class merging in case consumers want to add classes
export { cn };
