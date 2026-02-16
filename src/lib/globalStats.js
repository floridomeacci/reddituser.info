import { apiGet } from './apiClient';

let cachedStats = null;
let lastFetch = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getGlobalStats() {
  const now = Date.now();
  if (cachedStats && (now - lastFetch) < CACHE_DURATION) {
    return cachedStats;
  }

  try {
    const stats = await apiGet('/global-stats', { attempts: 2, baseDelay: 500 });
    cachedStats = stats;
    lastFetch = now;
    return stats;
  } catch (err) {
    console.warn('Failed to fetch global stats, using defaults:', err);
    // Return fallback values if endpoint fails
    return {
      karma_per_item: 10,
      activity_per_day: 0.5,
      comment_length: 75,
      controversy_pct: 8,
      ttr: 40,
      night_pct: 15,
      weekend_pct: 30,
      subreddit_count: 6,
      karma_efficiency: 8.5,
      total_users: 0
    };
  }
}
