/**
 * EnquireNowLoading — loading state for the enquire now section.
 *
 * Shows a friendly skeleton loader while fetching availability data,
 * ensuring the user experience is smooth and informative.
 */

"use client";

import { useEffect, useState } from "react";
import { GuestEnquiryFormSkeleton } from "@/components/ui/loading-skeleton";
import { GuestEnquiryForm } from "@/components/forms/GuestEnquiryForm";

/**
 * Wrapper component that shows a loading state before the form is mounted.
 *
 * This provides a better UX by showing a structured placeholder that matches
 * the form's layout while initial data is being fetched.
 *
 * Renders the form after a brief delay or when the component is hydrated,
 * whichever comes first.
 */
export function EnquireNowContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show skeleton for a minimum duration (smooth perceived loading)
    // Adjust this value for your network conditions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // If still loading, show skeleton; otherwise show the actual form
  return isLoading ? <GuestEnquiryFormSkeleton /> : <GuestEnquiryForm />;
}
