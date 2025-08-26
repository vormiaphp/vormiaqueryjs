import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Cache store using Zustand
 * Manages offline data caching, request queuing, and cache invalidation
 */
export const useCacheStore = create(
  persist(
    (set, get) => ({
      // Cache storage
      cache: new Map(),
      cacheStats: {
        totalSize: 0,
        totalItems: 0,
        lastCleanup: Date.now(),
      },

      // Offline queue
      offlineQueue: [],
      pendingRequests: [],

      // Configuration
      maxCacheSize: 100 * 1024 * 1024, // 100MB default
      maxCacheAge: 3600000, // 1 hour default
      maxCacheItems: 1000, // Max number of cache entries

      // Cache methods
      setCache: (key, data, options = {}) => {
        const {
          ttl = get().maxCacheAge,
          size = 0,
          priority = "normal",
          tags = [],
        } = options;

        const cacheEntry = {
          data,
          timestamp: Date.now(),
          ttl,
          size,
          priority,
          tags,
          accessCount: 0,
          lastAccessed: Date.now(),
        };

        const { cache, cacheStats } = get();
        const newCache = new Map(cache);

        // Remove existing entry if it exists
        if (newCache.has(key)) {
          const existing = newCache.get(key);
          cacheStats.totalSize -= existing.size || 0;
          cacheStats.totalItems -= 1;
        }

        newCache.set(key, cacheEntry);
        cacheStats.totalSize += size;
        cacheStats.totalItems += 1;

        set({ cache: newCache, cacheStats });

        // Auto-cleanup if cache is too large
        if (
          cacheStats.totalSize > get().maxCacheSize ||
          cacheStats.totalItems > get().maxCacheItems
        ) {
          get().cleanupCache();
        }
      },

      getCache: (key) => {
        const { cache } = get();
        const entry = cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
          get().removeCache(key);
          return null;
        }

        // Update access stats
        entry.accessCount += 1;
        entry.lastAccessed = Date.now();

        // Update cache with new stats
        const newCache = new Map(cache);
        newCache.set(key, entry);
        set({ cache: newCache });

        return entry.data;
      },

      removeCache: (key) => {
        const { cache, cacheStats } = get();
        const entry = cache.get(key);

        if (entry) {
          const newCache = new Map(cache);
          newCache.delete(key);

          cacheStats.totalSize -= entry.size || 0;
          cacheStats.totalItems -= 1;

          set({ cache: newCache, cacheStats });
        }
      },

      invalidateCache: (pattern) => {
        const { cache, cacheStats } = get();
        const newCache = new Map(cache);
        let removedSize = 0;
        let removedItems = 0;

        // Pattern can be string, regex, or function
        const matches = (key) => {
          if (typeof pattern === "string") {
            return key.includes(pattern);
          } else if (pattern instanceof RegExp) {
            return pattern.test(key);
          } else if (typeof pattern === "function") {
            return pattern(key);
          }
          return false;
        };

        for (const [key, entry] of newCache.entries()) {
          if (matches(key)) {
            removedSize += entry.size || 0;
            removedItems += 1;
            newCache.delete(key);
          }
        }

        cacheStats.totalSize -= removedSize;
        cacheStats.totalItems -= removedItems;

        set({ cache: newCache, cacheStats });
      },

      invalidateByTags: (tags) => {
        const { cache, cacheStats } = get();
        const newCache = new Map(cache);
        let removedSize = 0;
        let removedItems = 0;

        const tagArray = Array.isArray(tags) ? tags : [tags];

        for (const [key, entry] of newCache.entries()) {
          if (entry.tags && tagArray.some((tag) => entry.tags.includes(tag))) {
            removedSize += entry.size || 0;
            removedItems += 1;
            newCache.delete(key);
          }
        }

        cacheStats.totalSize -= removedSize;
        cacheStats.totalItems -= removedItems;

        set({ cache: newCache, cacheStats });
      },

      clearCache: () => {
        set({
          cache: new Map(),
          cacheStats: {
            totalSize: 0,
            totalItems: 0,
            lastCleanup: Date.now(),
          },
        });
      },

      // Cache cleanup and optimization
      cleanupCache: () => {
        const { cache, cacheStats, maxCacheSize } = get();
        const newCache = new Map(cache);
        let removedSize = 0;
        let removedItems = 0;
        const now = Date.now();

        // Remove expired entries
        for (const [key, entry] of newCache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            removedSize += entry.size || 0;
            removedItems += 1;
            newCache.delete(key);
          }
        }

        // If still too large, remove low priority items
        if (cacheStats.totalSize - removedSize > maxCacheSize) {
          const entries = Array.from(newCache.entries()).sort((a, b) => {
            // Sort by priority first, then by last accessed
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const aPriority = priorityOrder[a[1].priority] || 2;
            const bPriority = priorityOrder[b[1].priority] || 2;

            if (aPriority !== bPriority) {
              return bPriority - aPriority;
            }

            return a[1].lastAccessed - b[1].lastAccessed;
          });

          for (const [key, entry] of entries) {
            if (cacheStats.totalSize - removedSize <= maxCacheSize) break;

            removedSize += entry.size || 0;
            removedItems += 1;
            newCache.delete(key);
          }
        }

        cacheStats.totalSize -= removedSize;
        cacheStats.totalItems -= removedItems;
        cacheStats.lastCleanup = now;

        set({ cache: newCache, cacheStats });
      },

      // Offline queue management
      addToOfflineQueue: (request) => {
        const { offlineQueue } = get();
        const newQueue = [
          ...offlineQueue,
          {
            ...request,
            timestamp: Date.now(),
            id: Date.now() + Math.random(),
          },
        ];
        set({ offlineQueue: newQueue });
      },

      removeFromOfflineQueue: (requestId) => {
        const { offlineQueue } = get();
        const newQueue = offlineQueue.filter((req) => req.id !== requestId);
        set({ offlineQueue: newQueue });
      },

      clearOfflineQueue: () => {
        set({ offlineQueue: [] });
      },

      // Cache statistics
      getCacheStats: () => {
        const { cacheStats, cache } = get();
        const now = Date.now();

        // Calculate additional stats
        let expiredItems = 0;
        let totalAccessCount = 0;

        for (const entry of cache.values()) {
          if (now - entry.timestamp > entry.ttl) {
            expiredItems += 1;
          }
          totalAccessCount += entry.accessCount;
        }

        return {
          ...cacheStats,
          expiredItems,
          totalAccessCount,
          averageAccessCount:
            cache.size > 0 ? totalAccessCount / cache.size : 0,
          cacheEfficiency:
            cache.size > 0 ? (cache.size - expiredItems) / cache.size : 0,
        };
      },

      // Configuration methods
      setMaxCacheSize: (size) => {
        set({ maxCacheSize: size });
        get().cleanupCache();
      },

      setMaxCacheAge: (age) => {
        set({ maxCacheAge: age });
        get().cleanupCache();
      },

      setMaxCacheItems: (items) => {
        set({ maxCacheItems: items });
        get().cleanupCache();
      },
    }),
    {
      name: "vormia-cache-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cache: Array.from(state.cache.entries()),
        cacheStats: state.cacheStats,
        offlineQueue: state.offlineQueue,
        maxCacheSize: state.maxCacheSize,
        maxCacheAge: state.maxCacheAge,
        maxCacheItems: state.maxCacheItems,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert cache array back to Map
        if (state && Array.isArray(state.cache)) {
          state.cache = new Map(state.cache);
        }
      },
    }
  )
);
