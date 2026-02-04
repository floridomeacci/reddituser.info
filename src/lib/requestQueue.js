// Simple request queue with concurrency=1 and retry/backoff
const pending = [];
let active = 0;
const MAX_CONCURRENCY = 1;

function runNext() {
  if (active >= MAX_CONCURRENCY) return;
  const item = pending.shift();
  if (!item) return;
  active++;
  const { task, resolve, reject } = item;
  task()
    .then(res => resolve(res))
    .catch(err => reject(err))
    .finally(() => {
      active--;
      setTimeout(runNext, 0);
    });
}

export function queueRequest(taskFn) {
  return new Promise((resolve, reject) => {
    pending.push({ task: taskFn, resolve, reject });
    runNext();
  });
}

export async function fetchWithRetry(url, options = {}, attempts = 3, baseDelay = 500) {
  let attempt = 0;
  let lastErr;
  while (attempt < attempts) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      attempt++;
      if (attempt >= attempts) break;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr || new Error('Unknown fetch error');
}
