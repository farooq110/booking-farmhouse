/**
 * API client — the ONLY file that knows about `fetch` + the API base URL.
 *
 * Every consumer goes through these functions. Swapping fetch → axios
 * means editing only this file. The types in types/api.ts define the contract.
 *
 * All functions are isomorphic (work in both Next.js client components and
 * Vite). They run in the browser only — never on the server.
 *
 * Error Handling: All functions throw actual API errors. No fallback to mock data.
 */
import { API_CONFIG } from "@/data/media";
import type {
  CalendarResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  WeeklyScheduleResponse,
  OverridesResponse,
} from "@/types/api";

/** Build a full URL from a path + query params. */
function buildUrl(
  path: string,
  params?: Record<string, string | undefined>
): string {
  const base = API_CONFIG.baseUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

/** Wrapper around fetch that throws on non-2xx responses. */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errorMessage = `API error ${res.status}: ${res.statusText}`;
    
    try {
      const body = await res.json();
      // If API returns error details, include them
      if (body.message) {
        errorMessage = `${res.status} - ${body.message}`;
      } else if (body.error) {
        errorMessage = `${res.status} - ${body.error}`;
      } else if (typeof body === 'string') {
        errorMessage = `${res.status} - ${body}`;
      }
    } catch {
      // If response is not JSON, try to get text
      try {
        const text = await res.text();
        if (text) {
          errorMessage = `${res.status} - ${text}`;
        }
      } catch {
        // Use default error message
      }
    }
    
    console.error(`[Country Farm API Error] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

// ─── Availability ───────────────────────────────────────────

/**
 * Get the availability calendar for a service + date range.
 * Public endpoint — no auth required.
 *
 * @param serviceId  The service _id from the backend
 * @param startDate  YYYY-MM-DD
 * @param endDate    YYYY-MM-DD
 * @throws Error if API fails
 */
export async function getCalendar(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  return await apiFetch<CalendarResponse>(
    buildUrl(`/availability/${encodeURIComponent(serviceId)}/calendar`, {
      startDate,
      endDate,
    })
  );
}

// ─── Weekly Schedule ────────────────────────────────────────

/**
 * Get the standard weekly schedule for a service.
 * Protected endpoint — requires JWT authorization.
 *
 * @param serviceId  The service _id from the backend
 * @param token      JWT token for authorization
 * @throws Error if API fails
 */
export async function getWeeklySchedule(
  serviceId: string,
  token?: string
): Promise<WeeklyScheduleResponse> {
  return await apiFetch<WeeklyScheduleResponse>(
    buildUrl(`/availability/${encodeURIComponent(serviceId)}/schedule`),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
}

// ─── Availability Overrides ─────────────────────────────────

/**
 * Get availability overrides (holidays, alternate hours, etc.) for a service.
 * Protected endpoint — requires JWT authorization.
 *
 * @param serviceId  The service _id from the backend
 * @param token      JWT token for authorization
 * @throws Error if API fails
 */
export async function getOverrides(
  serviceId: string,
  token?: string
): Promise<OverridesResponse> {
  return await apiFetch<OverridesResponse>(
    buildUrl(`/availability/${encodeURIComponent(serviceId)}/overrides`),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
}

// ─── Bookings ───────────────────────────────────────────────

/**
 * Create a new booking. Public endpoint — no auth required.
 *
 * @param payload  The booking request (service_id, customer, date, slot, notes)
 * @throws Error if API fails
 */
export async function createBooking(
  payload: CreateBookingRequest
): Promise<CreateBookingResponse> {
  return await apiFetch<CreateBookingResponse>(
    buildUrl("/bookings"),
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}