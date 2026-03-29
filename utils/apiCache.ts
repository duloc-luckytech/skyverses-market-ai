/**
 * Lightweight in-memory cache for API responses.
 * Prevents redundant fetches when navigating back to pages.
 * 
 * Features:
 * - TTL-based expiration (default 2 minutes)
 * - Deduplicates in-flight requests (same key won't fire twice)
 * - Manual invalidation via cache.clear() or cache.delete(key)
 * - Max entries cap to prevent memory leaks
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const MAX_ENTRIES = 50;

class ApiCache {
  private store = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();

  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 2 * 60 * 1000): void {
    // Evict oldest if at capacity
    if (this.store.size >= MAX_ENTRIES) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Wrap an async fetch call with caching + deduplication.
   * If data exists in cache and isn't stale, returns it immediately.
   * If the same key is already being fetched, returns the in-flight promise.
   */
  async wrap<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 2 * 60 * 1000): Promise<T> {
    // 1. Check cache
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    // 2. Deduplicate in-flight requests
    const existing = this.inflight.get(key);
    if (existing) return existing;

    // 3. Fetch, cache, and clean up
    const promise = fetcher()
      .then((result) => {
        this.set(key, result, ttlMs);
        this.inflight.delete(key);
        return result;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }

  /**
   * Invalidate entries matching a prefix
   * e.g. cache.invalidate('market') clears 'market:solutions', 'market:featured', etc.
   */
  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton instance
export const apiCache = new ApiCache();
