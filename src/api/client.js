// Single entry point for talking to the Cinemi backend. Every request goes
// through apiFetch so the base URL, envelope unwrapping, and error handling
// live in one place instead of scattered fetch() calls.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Rewrite a direct upstream media URL through the backend's /proxy/media
// relay. Needed for CDNs (e.g. AllAnime) that require a Referer header and
// send no CORS headers — the browser can provide neither.
export function proxyMediaUrl(url, referer) {
  if (!url) return url;

  const base = BASE_URL || window.location.origin;
  const qs = new URLSearchParams({ url });
  if (referer) qs.set("ref", referer);

  return `${base}/proxy/media?${qs.toString()}`;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path, params) {
  // BASE_URL may be "" (same-origin via the Vite proxy) or an absolute URL.
  const url = new URL(path, BASE_URL || window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

export async function apiFetch(path, { params, signal } = {}) {
  const res = await fetch(buildUrl(path, params), { signal });

  let json = null;

  try {
    json = await res.json();
  } catch {
    // Non-JSON body (e.g. a gateway error page).
    if (!res.ok) {
      throw new ApiError(res.status, `Request failed: ${path}`);
    }
    throw new ApiError(res.status, `Invalid JSON from: ${path}`);
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(res.status, json?.error || json?.message || `Request failed: ${path}`);
  }

  // The backend wraps every payload as { success, data } — hand callers `data`.
  return json?.data;
}
