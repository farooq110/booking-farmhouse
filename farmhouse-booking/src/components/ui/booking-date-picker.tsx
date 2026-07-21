"use client";

/**
 * BookingDatePicker — a button that opens a calendar popup (Dialog + Calendar).
 *
 * WHY:
 *   The native <input type="date"> has inconsistent UI between mobile and
 *   desktop, has a small content area with blank space on the right, and
 *   is hard to theme. This component replaces it with:
 *     - A button (full-width) that matches the form's other input styles
 *     - A click-to-open Dialog with a Calendar inside
 *     - Disabled past dates (driven by `min` prop, YYYY-MM-DD)
 *     - Identical UI on mobile and desktop
 *     - Fixed dialog width (360px / 90vw on small screens) so the calendar
 *       is centered and never has blank space on the right
 *
 * Refs:
 *   - Calendar: src/components/ui/calendar.tsx (react-day-picker v9)
 *   - Dialog:   src/components/ui/dialog.tsx (Radix Dialog)
 */

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BookingDatePickerProps {
  /** Current value as YYYY-MM-DD string, or "" if no date selected. */
  value: string;
  /** Called when the user picks a date. */
  onChange: (val: string) => void;
  /** Minimum selectable date as YYYY-MM-DD. Dates before this are disabled. */
  min?: string;
  /** Validation error message to show (also turns the trigger border red). */
  error?: string;
  /** Optional extra className on the trigger button. */
  className?: string;
  /** Whether the trigger should be marked invalid (drives aria-invalid + red border). */
  "aria-invalid"?: boolean;
}

/** Parse a YYYY-MM-DD string into a local-midnight Date (or undefined). */
function parseISO(iso: string): Date | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt;
}

/** Format a Date back to YYYY-MM-DD (local, not UTC). */
function toISO(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingDatePicker({
  value,
  onChange,
  min,
  error,
  className,
  ...rest
}: BookingDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseISO(value);
  const minDate = min ? parseISO(min) : undefined;

  // Today at local midnight — used as the floor when no `min` is supplied
  // so the picker never allows past dates.
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const floor = minDate ?? todayMidnight;

  const displayLabel = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy")
    : "Pick a date";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            // Match the Input component's height/padding/border so it lines
            // up with the rest of the form fields on both mobile + desktop.
            "flex h-10 w-full items-center justify-between rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-left text-sm text-on-surface transition-colors",
            "hover:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "state-layer",
            error && "border-error",
            !selectedDate && "text-on-surface-variant/70",
            className
          )}
          aria-invalid={!!error || rest["aria-invalid"]}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-base text-primary shrink-0">
              event
            </span>
            <span className="truncate">{displayLabel}</span>
          </span>
          <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">
            calendar_month
          </span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="w-[360px] max-w-[90vw] p-0 overflow-hidden"
        // Stops click-inside from closing the dialog (Radix default closes on
        // any pointer-down inside content when there's no DialogClose — by
        // passing onPointerDownOutside we keep the calendar interactive).
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Pick a booking date</DialogTitle>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              onChange(toISO(d));
              setOpen(false);
            }
          }}
          disabled={{ before: floor }}
          initialFocus
          className="p-3"
        />
      </DialogContent>
    </Dialog>
  );
}
