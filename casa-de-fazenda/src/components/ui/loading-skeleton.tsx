/**
 * LoadingSkeleton — smooth, accessible loading placeholders.
 *
 * Used when content is being fetched to show a placeholder that matches
 * the shape of the actual content. Provides a better UX than spinners.
 *
 * Follows Material Design 3 and WCAG accessibility patterns.
 */

export interface LoadingSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Height of each row (Tailwind classes: h-4, h-6, h-8, etc.) */
  rowHeight?: string;
  /** Gap between rows */
  gap?: string;
  /** Whether to animate */
  animated?: boolean;
}

/**
 * Generic skeleton loader for text content.
 *
 * @example
 * <LoadingSkeleton rows={3} rowHeight="h-5" animated />
 */
export function LoadingSkeleton({
  rows = 3,
  rowHeight = "h-4",
  gap = "gap-3",
  animated = true,
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-${gap.split("-")[1] || "3"}`} role="status" aria-busy="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`${rowHeight} rounded-md bg-outline-variant/30 ${
            animated ? "animate-pulse" : ""
          }`}
        />
      ))}
      {animated && (
        <span className="sr-only">Loading content…</span>
      )}
    </div>
  );
}

/**
 * Skeleton loader for a form field (label + input).
 */
export function FormFieldSkeleton({ animated = true }: { animated?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-3 w-24 rounded-md bg-outline-variant/30 ${
          animated ? "animate-pulse" : ""
        }`}
      />
      <div
        className={`h-10 rounded-md bg-outline-variant/20 ${
          animated ? "animate-pulse" : ""
        }`}
      />
    </div>
  );
}

/**
 * Skeleton loader for a complete form section.
 */
export function FormSectionSkeleton({ fields = 2, animated = true }: { fields?: number; animated?: boolean }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, idx) => (
        <FormFieldSkeleton key={idx} animated={animated} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader that mimics the GuestEnquiryForm structure.
 *
 * Shows a user-friendly placeholder while the form is loading.
 */
export function GuestEnquiryFormSkeleton() {
  return (
    <div
      className="space-y-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 sm:p-8 elevation-2"
      role="status"
      aria-busy="true"
    >
      {/* Booking details section */}
      <div className="space-y-5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-outline-variant/30 animate-pulse" />
          <div className="h-3 w-32 rounded bg-outline-variant/30 animate-pulse" />
        </div>

        {/* Service select */}
        <FormFieldSkeleton animated />

        {/* Date input */}
        <FormFieldSkeleton animated />

        {/* Slot select (loading state) */}
        <div className="space-y-1.5">
          <div className="h-3 w-32 rounded bg-outline-variant/30 animate-pulse" />
          <div className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 animate-pulse">
            <div className="h-5 w-5 rounded bg-outline-variant/30" />
            <div className="h-4 w-40 rounded bg-outline-variant/30" />
          </div>
        </div>
      </div>

      <div className="h-px bg-outline-variant/60" />

      {/* Contact section */}
      <div className="space-y-5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-outline-variant/30 animate-pulse" />
          <div className="h-3 w-24 rounded bg-outline-variant/30 animate-pulse" />
        </div>

        <FormFieldSkeleton animated />

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <FormFieldSkeleton animated />
          <FormFieldSkeleton animated />
        </div>
      </div>

      <div className="h-px bg-outline-variant/60" />

      {/* Additional preferences section */}
      <div className="space-y-5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-outline-variant/30 animate-pulse" />
          <div className="h-3 w-32 rounded bg-outline-variant/30 animate-pulse" />
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <FormFieldSkeleton animated />
          <FormFieldSkeleton animated />
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <FormFieldSkeleton animated />
          <FormFieldSkeleton animated />
        </div>
      </div>

      <div className="h-px bg-outline-variant/60" />

      {/* House rules section */}
      <div className="rounded-2xl bg-secondary-container/30 p-5 space-y-4">
        <div className="h-3 w-32 rounded bg-outline-variant/30 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 w-48 rounded bg-outline-variant/30 animate-pulse" />
          ))}
        </div>
        <div className="h-10 rounded-md bg-outline-variant/20 animate-pulse mt-4" />
      </div>

      {/* Notes section */}
      <div className="space-y-1.5">
        <div className="h-3 w-48 rounded bg-outline-variant/30 animate-pulse" />
        <div className="h-20 rounded-md bg-outline-variant/20 animate-pulse" />
      </div>

      {/* Submit button */}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-64 rounded bg-outline-variant/30 animate-pulse" />
        <div className="h-10 w-40 rounded-lg bg-primary/30 animate-pulse" />
      </div>

      <span className="sr-only">Loading booking form…</span>
    </div>
  );
}
