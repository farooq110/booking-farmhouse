"use client";
/**
 * ThemedToaster — premium sonner v2 toaster wired to the country-farm design system.
 * Refs: https://sonner.emilkowal.ski/
 */
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

export function ThemedToaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      duration={5000}
      visibleToasts={3}
      swipeDirections={["right", "left"]}
      className={cn("cf-toaster", props.className)}
      style={{
        "--normal-bg": "oklch(0.22 0.015 145)",
        "--normal-text": "oklch(0.96 0.005 95)",
        "--normal-border": "oklch(0.78 0.13 80 / 0.18)",
        "--success-bg": "oklch(0.22 0.015 145)",
        "--success-text": "oklch(0.96 0.005 95)",
        "--success-border": "oklch(0.78 0.13 80 / 0.4)",
        "--error-bg": "oklch(0.27 0.04 25)",
        "--error-text": "oklch(0.96 0.005 95)",
        "--error-border": "oklch(0.65 0.18 25 / 0.5)",
        "--warning-bg": "oklch(0.27 0.04 75)",
        "--warning-text": "oklch(0.96 0.005 95)",
        "--warning-border": "oklch(0.75 0.15 75 / 0.5)",
        "--info-bg": "oklch(0.22 0.015 145)",
        "--info-text": "oklch(0.96 0.005 95)",
        "--info-border": "oklch(0.78 0.13 80 / 0.25)",
        ...props.style,
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast: "cf-toast",
          title: "cf-toast__title",
          description: "cf-toast__desc",
          actionButton: "cf-toast__action",
          cancelButton: "cf-toast__cancel",
          closeButton: "cf-toast__close",
          icon: "cf-toast__icon",
          loader: "cf-toast__loader",
        },
        style: {
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 30px -6px oklch(0 0 0 / 0.45), 0 4px 12px -2px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.05)",
          border: "1px solid var(--normal-border)",
          backdropFilter: "blur(8px)",
        },
      }}
      gap={8}
      offset={20}
      {...props}
    />
  );
}

export { toast } from "sonner";
