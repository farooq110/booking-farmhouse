/**
 * src/lib/images.tsx — SINGLE SOURCE OF TRUTH for next/image.
 * Includes a built-in themed loader overlay shown while any image loads.
 * Refs: https://nextjs.org/docs/app/api-reference/components/image
 */
"use client";
import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: ImageProps["src"];
  alt: string;
  className?: string;
  priority?: boolean;
  eager?: boolean;
  wrapperClassName?: string;
  skipLoader?: boolean;
}

export function OptimizedImage({
  src, alt, className, priority = false, eager = false, fill, wrapperClassName, skipLoader = false, ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showLoader = !loaded && !errored && !skipLoader;

  const composedClassName = cn(
    "overflow-hidden transition-opacity duration-500",
    !loaded && !errored && "opacity-0",
    errored && "opacity-100",
    className
  );

  const loaderOverlay = showLoader ? (
    <span aria-hidden="true" className="cf-img-loader">
      <span className="cf-img-loader__mark" />
    </span>
  ) : null;

  if (fill) {
    return (
      <span className={cn("block absolute inset-0 overflow-hidden", wrapperClassName)}>
        {loaderOverlay}
        <Image
          src={src} alt={alt} fill priority={priority}
          loading={priority ? undefined : eager ? "eager" : "lazy"}
          className={composedClassName}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...rest}
        />
      </span>
    );
  }
  return (
    <span className={cn("relative block overflow-hidden", wrapperClassName)}>
      {loaderOverlay}
      <Image
        src={src} alt={alt} priority={priority}
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
