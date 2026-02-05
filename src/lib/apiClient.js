import { queueRequest, fetchWithRetry } from './requestQueue';

let resolvedBase = null;
let resolving = false;

// Production: always use https://api.reddituser.info (Cloudflare proxy handles SSL)
// Local dev: use http://localhost:5000 or http://37.27.27.247:5000
const IS_PRODUCTION = typeof window !== 'undefined' && window.location.protocol === 'https:';
const PRODUCTION_API = 'https://api.reddituser.info';

export async function resolveApiBase() {
  if (resolvedBase) return resolvedBase;
  if (resolving) {
    while (resolving) {
      await new Promise(r => setTimeout(r, 50));
    }
    return resolvedBase;
  }
  resolving = true;

  if (IS_PRODUCTION) {
    // In production (HTTPS), always use Cloudflare-proxied domain
    // No port probing needed - Cloudflare handles SSL termination on port 443
    try {
      const res = await fetch(PRODUCTION_API + '/health');
      if (res.ok) {
        resolvedBase = PRODUCTION_API;
      }
    } catch (_) {
      // Even if health check fails, use it anyway - it's the only valid option on HTTPS
      resolvedBase = PRODUCTION_API;
    }
  } else {
    // Local development - try localhost first, then direct IP
    const devHosts = [
      'http://localhost:5000',
      'http://localhost:5001',
      'http://37.27.27.247:5000',
      'http://37.27.27.247:5001'
    ];
    for (const base of devHosts) {
      try {
        const res = await fetch(base + '/health');
        if (res.ok) {
          resolvedBase = base;
          break;
        }
      } catch (_) {
        // try next
      }
    }
    if (!resolvedBase) resolvedBase = 'http://localhost:5000';
  }

  resolving = false;
  return resolvedBase;
}

export async function apiPost(path, body, opts = {}) {
  const base = await resolveApiBase();
  const url = base + path;
  return queueRequest(() => fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body)
  }, opts.attempts || 3, opts.baseDelay || 500));
}

export async function apiGet(path, opts = {}) {
  const base = await resolveApiBase();
  const url = base + path;
  // GETs are light and frequent (for queue polling). Don't serialize via queueRequest.
  return fetchWithRetry(url, {
    method: 'GET',
    headers: { ...(opts.headers || {}) }
  }, opts.attempts || 3, opts.baseDelay || 500);
}

// High-level helper to use server-managed queue for /analyze
// payload: { username, include_raw?, top?, force_refresh? }
// options: { onUpdate?: (statusObj)=>void, pollIntervalMs?: number, attempts?, baseDelay? }
export async function analyzeWithQueue(payload, options = {}) {
  const { onUpdate, pollIntervalMs = 1500, attempts = 3, baseDelay = 600 } = options;
  // Ask server to enqueue (backward compatible if server doesn't support queue)
  const initial = await apiPost('/analyze', { ...payload, queue: true }, {
    attempts,
    baseDelay,
    headers: { 'X-Queue': '1' }
  });

  // If server already returned full analysis (older server), just return it
  if (initial && (initial.comments || initial.posts || initial.about || initial.account_info) && !initial.status) {
    return initial;
  }

  // Expect a queued/processing response
  let requestId = initial.request_id || initial.id || initial.token || initial.requestId;
  let status = initial.status || 'queued';
  let position = initial.position ?? null;
  let eta_seconds = initial.eta_seconds ?? initial.eta ?? null;
  onUpdate && onUpdate({ status, position, eta_seconds });

  // Poll status until done
  while (true) {
    await new Promise(r => setTimeout(r, pollIntervalMs));
    const statusRes = await apiGet(`/queue/status?request_id=${encodeURIComponent(requestId)}`, { attempts: 1, baseDelay });
    const s = statusRes.status || statusRes.state || 'queued';
    const pos = statusRes.position ?? statusRes.pos ?? null;
    const eta = statusRes.eta_seconds ?? statusRes.eta ?? null;
    onUpdate && onUpdate({ status: s, position: pos, eta_seconds: eta });

    if (s === 'done' || s === 'completed' || s === 'ready') {
      // Some servers embed result directly
      if (statusRes.result) return statusRes.result;
      // Otherwise fetch result from a dedicated endpoint
      const result = await apiGet(`/queue/result?request_id=${encodeURIComponent(requestId)}`, { attempts: 1, baseDelay });
      return result;
    }
    if (s === 'error' || s === 'failed') {
      const msg = statusRes.message || 'Queue processing failed';
      throw new Error(msg);
    }
  }
}
