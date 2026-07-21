"use client";
/**
 * BookingDatePicker — a button that opens a themed calendar popup.
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
  value: string;
  onChange: (val: string) => void;
  min?: string;
  error?: string;
  className?: string;
  "aria-invalid"?: boolean;
}

function parseISO(iso: string): Date | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt;
}

function toISO(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingDatePicker({
  value, onChange, min, error, className, ...rest
}: BookingDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseISO(value);
  const minDate = min ? parseISO(min) : undefined;

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
            "flex h-10 w-full items-center justify-between rounded-md border bg-surface-container-low px-3 py-2 text-left text-sm text-on-surface transition-all",
            "hover:border-primary hover:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            error ? "border-error" : "border-outline-variant",
            !selectedDate && "text-on-surface-variant/70",
            "state-layer",
            className
          )}
          aria-invalid={!!error || rest["aria-invalid"]}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "material-symbols-outlined text-base shrink-0 transition-colors",
              selectedDate ? "text-tertiary" : "text-on-surface-variant"
            )}>
              {selectedDate ? "event_available" : "event"}
            </span>
            <span className="truncate">{displayLabel}</span>
          </span>
          <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">
            calendar_month
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "w-[360px] max-w-[92vw] p-0 overflow-hidden",
          "cf-date-dialog",
          "border border-amber-soft/30 elevation-4",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setOpen(false)}
      >
        <DialogTitle className="sr-only">Pick a booking date</DialogTitle>

        <div className="cf-date-dialog__header">
          <div className="flex items-center gap-2">
            <span className="cf-date-dialog__icon material-symbols-outlined">
              event_available
            </span>
            <div>
              <p className="cf-date-dialog__eyebrow">Select your date</p>
              <p className="cf-date-dialog__title">
                {selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}
              </p>
            </div>
          </div>
          <span className="cf-date-dialog__badge">
            <span className="material-symbols-outlined text-[12px] mr-1">today</span>
            Today onwards
          </span>
        </div>

        <div className="cf-date-dialog__calendar">
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
            className="cf-calendar"
          />
        </div>

        <div className="cf-date-dialog__footer">
          <span className="cf-date-dialog__footer-hint">
            <span className="material-symbols-outlined text-[14px] mr-1">
              info
            </span>
            Past dates are disabled. Tap a date to confirm.
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cf-date-dialog__close"
            aria-label="Close date picker"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
