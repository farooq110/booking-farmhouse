"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaButton = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 disabled:opacity-50 disabled:pointer-events-none state-layer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-container elevation-1 hover:elevation-2",
        outline:
          "border border-outline text-on-surface hover:bg-secondary-container hover:text-on-secondary-container",
        tertiary:
          "bg-tertiary-container text-on-tertiary-container hover:elevation-2",
        ghost: "text-on-surface-variant hover:text-on-surface",
      },
      size: {
        sm: "text-xs px-4 py-2 rounded-full tracking-luxe uppercase",
        md: "text-xs px-6 py-3 rounded-full tracking-luxe uppercase",
        lg: "text-xs px-8 py-3.5 rounded-full tracking-luxe uppercase",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface CTAButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ctaButton> {}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(ctaButton({ variant, size }), className)}
      {...props}
    />
  )
);
CTAButton.displayName = "CTAButton";

export interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** Tiny uppercase moss eyebrow above a section heading */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary mb-4",
        className
      )}
    >
      <span className="h-px w-6 bg-tertiary" />
      {children}
    </span>
  );
}

export interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-display font-medium text-balance leading-[1.08] text-on-surface",
        "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Material Symbols icon wrapper */
export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "name"> {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
}

export function Icon({
  name,
  className,
  filled = false,
  weight = 400,
  ...rest
}: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24`,
      }}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}
