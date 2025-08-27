import { useCallback, useRef, useEffect } from "react";
import { useCacheStore } from "../stores/useCacheStore.js";

/**
 * Enhanced caching hook with vormiaqueryjs-style syntax
 * Provides easy-to-use caching operations with automatic refresh and management
 */
export const useVormiaCache = (options = {}) => {
  const {
    defaultTTL = 3600000, // 1 hour default
    defaultPriority = "normal",
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    maxRetries = 3,
    retryDelay = 1000, // 1 second
  } = options;

  const {
    setCache,
    getCache,
    removeCache,
    invalidateCache,
    invalidateByTags,
    clearCache,
    getCacheStats,
    setMaxCacheSize,
    setMaxCacheAge,
    setMaxCacheItems,
  } = useCacheStore();

  // Track refresh timers
  const refreshTimers = useRef(new Map());
  const retryCounters = useRef(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      refreshTimers.current.forEach((timer) => clearTimeout(timer));
      refreshTimers.current.clear();
    };
  }, []);

  /**
   * Store data in cache with enhanced options
   */
  const store = useCallback(
    (key, data, cacheOptions = {}) => {
      const {
        ttl = defaultTTL,
        priority = defaultPriority,
        tags = [],
        size = 0,
        autoRefresh: itemAutoRefresh = autoRefresh,
        refreshInterval: itemRefreshInterval = refreshInterval,
        refreshFunction,
        maxRetries: itemMaxRetries = maxRetries,
        retryDelay: itemRetryDelay = retryDelay,
      } = cacheOptions;

      // Store in cache
      setCache(key, data, {
        ttl,
        priority,
        tags,
        size,
      });

      // Setup auto-refresh if enabled
      if (itemAutoRefresh && refreshFunction) {
        setupAutoRefresh(
          key,
          refreshFunction,
          itemRefreshInterval,
          itemMaxRetries,
          itemRetryDelay
        );
      }

      return { success: true, key, ttl, priority, tags };
    },
    [
      setCache,
      defaultTTL,
      defaultPriority,
      autoRefresh,
      refreshInterval,
      maxRetries,
      retryDelay,
    ]
  );

  /**
   * Retrieve data from cache with optional refresh
   */
  const get = useCallback(
    (key, options = {}) => {
      const {
        refresh = false,
        refreshFunction,
        fallback = null,
        validate = null,
      } = options;

      // Get from cache
      const cachedData = getCache(key);

      // If no cached data and fallback provided
      if (!cachedData && fallback) {
        return fallback;
      }

      // If refresh requested and refresh function provided
      if (refresh && refreshFunction && cachedData) {
        refreshData(key, refreshFunction, options);
      }

      // Validate data if validator provided
      if (cachedData && validate && !validate(cachedData)) {
        removeCache(key);
        return fallback;
      }

      return cachedData;
    },
    [getCache, removeCache]
  );

  /**
   * Refresh cached data
   */
  const refresh = useCallback(
    async (key, refreshFunction, options = {}) => {
      const {
        fallback = null,
        validate = null,
        maxRetries: itemMaxRetries = maxRetries,
        retryDelay: itemRetryDelay = retryDelay,
      } = options;

      try {
        const newData = await refreshFunction();

        // Validate new data if validator provided
        if (validate && !validate(newData)) {
          throw new Error("Data validation failed");
        }

        // Update cache with new data
        const existingEntry = getCache(key);
        if (existingEntry) {
          setCache(key, newData, {
            ttl: existingEntry.ttl || defaultTTL,
            priority: existingEntry.priority || defaultPriority,
            tags: existingEntry.tags || [],
            size: existingEntry.size || 0,
          });
        }

        return { success: true, data: newData, refreshed: true };
      } catch (error) {
        // Handle retries
        const retryCount = retryCounters.current.get(key) || 0;
        if (retryCount < itemMaxRetries) {
          retryCounters.current.set(key, retryCount + 1);

          setTimeout(() => {
            refresh(key, refreshFunction, options);
          }, itemRetryDelay * (retryCount + 1)); // Exponential backoff

          return {
            success: false,
            error: "Retrying...",
            retryCount: retryCount + 1,
          };
        }

        // Return fallback if all retries failed
        return {
          success: false,
          error: error.message,
          data: fallback,
          retryCount,
        };
      }
    },
    [getCache, setCache, defaultTTL, defaultPriority, maxRetries]
  );

  /**
   * Refresh data with automatic retry logic
   */
  const refreshData = useCallback(
    async (key, refreshFunction, options) => {
      const result = await refresh(key, refreshFunction, options);

      if (result.success) {
        retryCounters.current.delete(key);
      }

      return result;
    },
    [refresh]
  );

  /**
   * Setup automatic refresh for a cache key
   */
  const setupAutoRefresh = useCallback(
    (key, refreshFunction, interval, maxRetries, retryDelay) => {
      // Clear existing timer
      if (refreshTimers.current.has(key)) {
        clearTimeout(refreshTimers.current.get(key));
      }

      // Setup new timer
      const timer = setInterval(async () => {
        try {
          await refreshData(key, refreshFunction, { maxRetries, retryDelay });
        } catch (error) {
          console.warn(`Auto-refresh failed for key: ${key}`, error);
        }
      }, interval);

      refreshTimers.current.set(key, timer);
    },
    [refreshData]
  );

  /**
   * Remove specific cache entry
   */
  const remove = useCallback(
    (key) => {
      // Clear refresh timer if exists
      if (refreshTimers.current.has(key)) {
        clearTimeout(refreshTimers.current.get(key));
        refreshTimers.current.delete(key);
      }

      // Clear retry counter
      retryCounters.current.delete(key);

      // Remove from cache
      removeCache(key);
      return { success: true, key };
    },
    [removeCache]
  );

  /**
   * Clear all cache entries
   */
  const clear = useCallback(() => {
    // Clear all refresh timers
    refreshTimers.current.forEach((timer) => clearTimeout(timer));
    refreshTimers.current.clear();
    retryCounters.current.clear();

    // Clear cache
    clearCache();
    return { success: true, message: "All cache cleared" };
  }, [clearCache]);

  /**
   * Invalidate cache by pattern or tags
   */
  const invalidate = useCallback(
    (pattern, options = {}) => {
      const { clearTimers = true } = options;

      if (clearTimers) {
        // Clear refresh timers for matching keys
        refreshTimers.current.forEach((timer, key) => {
          if (typeof pattern === "string" && key.includes(pattern)) {
            clearTimeout(timer);
            refreshTimers.current.delete(key);
            retryCounters.current.delete(key);
          } else if (pattern instanceof RegExp && pattern.test(key)) {
            clearTimeout(timer);
            refreshTimers.current.delete(key);
            retryCounters.current.delete(key);
          }
        });
      }

      // Invalidate cache
      invalidateCache(pattern);
      return { success: true, pattern };
    },
    [invalidateCache]
  );

  /**
   * Invalidate cache by tags
   */
  const invalidateByTagsCache = useCallback(
    (tags, options = {}) => {
      const { clearTimers = true } = options;

      if (clearTimers) {
        // This is a simplified approach - in a real implementation,
        // we'd need to check which keys have these tags
        // For now, we'll clear all timers when invalidating by tags
        refreshTimers.current.forEach((timer) => clearTimeout(timer));
        refreshTimers.current.clear();
        retryCounters.current.clear();
      }

      // Invalidate by tags
      invalidateByTags(tags);
      return { success: true, tags };
    },
    [invalidateByTags]
  );

  /**
   * Get cache statistics
   */
  const stats = useCallback(() => {
    return getCacheStats();
  }, [getCacheStats]);

  /**
   * Configure cache settings
   */
  const configure = useCallback(
    (config) => {
      const { maxSize, maxAge, maxItems } = config;

      if (maxSize !== undefined) {
        setMaxCacheSize(maxSize);
      }
      if (maxAge !== undefined) {
        setMaxCacheAge(maxAge);
      }
      if (maxItems !== undefined) {
        setMaxCacheItems(maxItems);
      }

      return { success: true, config };
    },
    [setMaxCacheSize, setMaxCacheAge, setMaxCacheItems]
  );

  /**
   * Check if data exists in cache
   */
  const exists = useCallback(
    (key) => {
      const data = getCache(key);
      return data !== null;
    },
    [getCache]
  );

  /**
   * Get cache entry metadata
   */
  const getMetadata = useCallback((key) => {
    const { cache } = useCacheStore.getState();
    const entry = cache.get(key);

    if (!entry) return null;

    return {
      key,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      expiresAt: entry.timestamp + entry.ttl,
      isExpired: Date.now() > entry.timestamp + entry.ttl,
      priority: entry.priority,
      tags: entry.tags,
      size: entry.size,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed,
      timeToLive: Math.max(0, entry.timestamp + entry.ttl - Date.now()),
    };
  }, []);

  return {
    // Core operations
    store,
    get,
    refresh,
    remove,
    clear,
    invalidate,
    invalidateByTags: invalidateByTagsCache,

    // Utility methods
    exists,
    getMetadata,
    stats,
    configure,

    // Configuration
    defaultTTL,
    defaultPriority,
    autoRefresh,
    refreshInterval,
    maxRetries,
    retryDelay,
  };
};

export default useVormiaCache;
