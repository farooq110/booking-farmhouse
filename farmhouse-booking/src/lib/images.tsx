/**
 * src/lib/images.tsx — SINGLE SOURCE OF TRUTH for next/image.
 *
 * Every image in the app goes through `OptimizedImage` (re-exported below).
 * Plain <img> is FORBIDDEN for raster assets (see AGENTS.md).
 *
 * OptimizedImage also ships with a built-in themed loader:
 *   - Tracks load state via onLoad / onError
 *   - Shows a branded spinner overlay (same palette as ThemedAppLoader)
 *     while the image is loading
 *   - Fades the image in once loaded
 *   - Honors `skipLoader` opt-out (for tiny icons / already-cached images)
 *
 * Refs: https://nextjs.org/docs/app/api-reference/components/image
 */

"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  /** Required — the image source. Either a static import or a string URL. */
  src: ImageProps["src"];
  /** Required — meaningful description for screen readers. */
  alt: string;
  /** Optional className applied to the <Image> root. */
  className?: string;
  /** When true, sets `priority` (preloads the image; use for LCP / above-the-fold hero). */
  priority?: boolean;
  /** When true, sets `loading="eager"` (above-the-fold non-LCP). Defaults to lazy. */
  eager?: boolean;
  /** Optional Tailwind classes for the wrapper. Only used with `fill`. */
  wrapperClassName?: string;
  /** Skip the themed loading skeleton (e.g. for tiny icons or cached images). */
  skipLoader?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  eager = false,
  fill,
  wrapperClassName,
  skipLoader = false,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  // Show the loader while the image is still loading AND the caller didn't
  // opt out. We also hide it after an error so the broken-image icon shows.
  const [errored, setErrored] = useState(false);
  const showLoader = !loaded && !errored && !skipLoader;

  // The image fades in once loaded (transition on opacity).
  const composedClassName = cn(
    "overflow-hidden transition-opacity duration-500",
    !loaded && !errored && "opacity-0",
    errored && "opacity-100",
    className
  );

  // The loader overlay — a small themed spinner matching ThemedAppLoader.
  // Lives at z-1, pointer-events: none, so it never blocks clicks on the
  // underlying image (e.g. on previewable MediaSlot buttons).
  const loaderOverlay = showLoader ? (
    <span aria-hidden="true" className="cf-img-loader">
      <span className="cf-img-loader__mark" />
    </span>
  ) : null;

  if (fill) {
    // Fill mode: parent must be `position: relative` and have a size.
    // Note: when `priority` is true, Next.js Image forces `loading="eager"`
    // + preload, so we must NOT also pass `loading`.
    return (
      <span
        className={cn(
          "block absolute inset-0 overflow-hidden",
          wrapperClassName
        )}
      >
        {loaderOverlay}
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : eager ? "eager" : "lazy"}
          className={composedClassName}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...rest}
        />
      </span>
    );
  }

  // Non-fill: caller passes width + height (or a static import that supplies them).
  // We wrap in a relative span so the loader overlay can position absolutely.
  return (
    <span
      className={cn(
        "relative block overflow-hidden",
        wrapperClassName
      )}
    >
      {loaderOverlay}
      <Image
        src={src}
        alt={alt}
        priority={priority}
        loading={priority ? undefined : eager ? "eager" : "lazy"}
        className={composedClassName}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        {...rest}
      />
    </span>
  );
}

export default Image;
