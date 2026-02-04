import { queueRequest, fetchWithRetry } from './requestQueue';

let resolvedBase = null;
let resolving = false;

export async function resolveApiBase(preferredHost = '37.27.27.247') {
  if (resolvedBase) return resolvedBase;
  if (resolving) {
    // wait until resolving finished
    while (resolving) {
      await new Promise(r => setTimeout(r, 50));
    }
    return resolvedBase;
  }
  resolving = true;
  const ports = [5000, 5001];
  for (const port of ports) {
    const base = `http://${preferredHost}:${port}`;
    try {
      const res = await fetch(base + '/health');
      if (res.ok) {
        resolvedBase = base;
        break;
      }
    } catch (_) {
      // ignore and try next
    }
  }
  // fallback to first
  if (!resolvedBase) resolvedBase = `http://${preferredHost}:5000`;
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
