/**
 * API client — the ONLY file that knows about fetch + the API base URL.
 *
 * ERROR HANDLING: Functions NEVER throw. They return a discriminated union:
 *   { ok: true,  data: T }                          — success
 *   { ok: false, error: ApiError }                  — known failure
 *
 * Error kinds:
 *   - "no-config"        — NEXT_PUBLIC_API_BASE_URL not set
 *   - "no-service-id"    — NEXT_PUBLIC_DEFAULT_SERVICE_ID not set
 *   - "no-network"       — fetch threw TypeError (server down, DNS, CORS, offline)
 *   - "timeout"          — request exceeded AbortController timeout (15s)
 *   - "client"          — 4xx response (400, 409 conflict, 422 validation, 429 rate limit)
 *   - "server"          — 5xx response
 *   - "parse"           — response body wasn't valid JSON
 *   - "unknown"         — anything else
 */
import { API_CONFIG } from "@/data/media";
import type {
  CalendarResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  WeeklyScheduleResponse,
  OverridesResponse,
} from "@/types/api";

export type ApiErrorKind =
  | "no-config" | "no-service-id" | "no-network" | "timeout"
  | "client" | "server" | "parse" | "unknown";

export interface ApiError {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  technical?: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const DEFAULT_TIMEOUT_MS = 15000;

function buildUrl(path: string, params?: Record<string, string | undefined>): string | null {
  const base = API_CONFIG.baseUrl?.replace(/\/$/, "");
  if (!base) return null;
  try {
    const url = new URL(`${base}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: {
        kind: "timeout",
        message: "The booking server took too long to respond. Please check your connection and try again.",
        technical: `timeout after ${DEFAULT_TIMEOUT_MS}ms`,
      }};
    }
    if (err instanceof TypeError) {
      return { ok: false, error: {
        kind: "no-network",
        message: "We couldn't reach the booking server. It may be down or your device may be offline. Please try again in a moment.",
        technical: err.message,
      }};
    }
    return { ok: false, error: {
      kind: "unknown",
      message: "Something unexpected happened. Please try again.",
      technical: err instanceof Error ? err.message : String(err),
    }};
  }

  clearTimeout(timeoutId);

  if (!res.ok) {
    const kind: ApiErrorKind = res.status >= 500 ? "server" : "client";
    let bodyMessage: string | undefined;
    try {
      const body = await res.json();
      bodyMessage = body?.message ?? body?.error ?? undefined;
    } catch {
      try {
        const text = await res.text();
        if (text) bodyMessage = text.slice(0, 200);
      } catch {}
    }
    let message: string;
    if (res.status === 404) message = "The booking service couldn't find this resource. It may have been removed.";
    else if (res.status === 409) message = bodyMessage ?? "This slot is already booked. Please pick another time or date.";
    else if (res.status === 422) message = bodyMessage ?? "Some of the submitted details were invalid.";
    else if (res.status === 429) message = "You're submitting too quickly. Please wait a moment and try again.";
    else if (res.status >= 500) message = "The booking server is having a problem right now. Please try again in a moment.";
    else message = bodyMessage ?? "We couldn't process your request. Please try again.";

    // eslint-disable-next-line no-console
    console.error(`[API ${res.status}] ${kind}:`, bodyMessage ?? res.statusText);
    return { ok: false, error: { kind, message, status: res.status, technical: bodyMessage ?? `${res.status} ${res.statusText}` }};
  }

  try {
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err: unknown) {
    return { ok: false, error: {
      kind: "parse",
      message: "The booking server returned an unexpected response. Please try again.",
      technical: err instanceof Error ? err.message : String(err),
    }};
  }
}

export async function getCalendar(serviceId: string, startDate: string, endDate: string): Promise<ApiResult<CalendarResponse>> {
  if (!API_CONFIG.baseUrl) return { ok: false, error: { kind: "no-config", message: "The booking service is not configured. Please contact the owner to book by phone or email." }};
  if (!serviceId) return { ok: false, error: { kind: "no-service-id", message: "The booking service is not configured. Please contact the owner to book by phone or email." }};
  const url = buildUrl(`/availability/${encodeURIComponent(serviceId)}/calendar`, { startDate, endDate });
  if (!url) return { ok: false, error: { kind: "no-config", message: "The booking service URL is misconfigured. Please contact the owner." }};
  return apiFetch<CalendarResponse>(url);
}

export async function getWeeklySchedule(serviceId: string, token?: string): Promise<ApiResult<WeeklyScheduleResponse>> {
  if (!API_CONFIG.baseUrl) return { ok: false, error: { kind: "no-config", message: "API not configured." }};
  if (!serviceId) return { ok: false, error: { kind: "no-service-id", message: "Service not configured." }};
  const url = buildUrl(`/availability/${encodeURIComponent(serviceId)}/schedule`);
  if (!url) return { ok: false, error: { kind: "no-config", message: "API URL misconfigured." }};
  return apiFetch<WeeklyScheduleResponse>(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }});
}

export async function getOverrides(serviceId: string, token?: string): Promise<ApiResult<OverridesResponse>> {
  if (!API_CONFIG.baseUrl) return { ok: false, error: { kind: "no-config", message: "API not configured." }};
  if (!serviceId) return { ok: false, error: { kind: "no-service-id", message: "Service not configured." }};
  const url = buildUrl(`/availability/${encodeURIComponent(serviceId)}/overrides`);
  if (!url) return { ok: false, error: { kind: "no-config", message: "API URL misconfigured." }};
  return apiFetch<OverridesResponse>(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }});
}

export async function createBooking(payload: CreateBookingRequest): Promise<ApiResult<CreateBookingResponse>> {
  if (!API_CONFIG.baseUrl) return { ok: false, error: { kind: "no-config", message: "The booking service is not configured. Please contact the owner to book by phone or email." }};
  if (!payload.service_id) return { ok: false, error: { kind: "no-service-id", message: "The booking service is not configured. Please contact the owner." }};
  const url = buildUrl("/bookings");
  if (!url) return { ok: false, error: { kind: "no-config", message: "API URL misconfigured." }};
  return apiFetch<CreateBookingResponse>(url, { method: "POST", body: JSON.stringify(payload) });
}
