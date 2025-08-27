import { writable, onDestroy } from "svelte";
import { useCacheStore } from "../stores/useCacheStore.js";

/**
 * Enhanced caching hook for Svelte with vormiaqueryjs-style syntax
 * Provides easy-to-use caching operations with automatic refresh and management
 */
export const useVormiaCacheSvelte = (options = {}) => {
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
  const refreshTimers = new Map();
  const retryCounters = new Map();

  // Cleanup timers on destroy
  onDestroy(() => {
    refreshTimers.forEach((timer) => clearTimeout(timer));
    refreshTimers.clear();
  });

  /**
   * Store data in cache with enhanced options
   */
  const store = (key, data, cacheOptions = {}) => {
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
  };

  /**
   * Retrieve data from cache with optional refresh
   */
  const get = (key, options = {}) => {
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
  };

  /**
   * Refresh cached data
   */
  const refresh = async (key, refreshFunction, options = {}) => {
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
      const retryCount = retryCounters.get(key) || 0;
      if (retryCount < itemMaxRetries) {
        retryCounters.set(key, retryCount + 1);

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
  };

  /**
   * Refresh data with automatic retry logic
   */
  const refreshData = async (key, refreshFunction, options) => {
    const result = await refresh(key, refreshFunction, options);

    if (result.success) {
      retryCounters.delete(key);
    }

    return result;
  };

  /**
   * Setup automatic refresh for a cache key
   */
  const setupAutoRefresh = (
    key,
    refreshFunction,
    interval,
    maxRetries,
    retryDelay
  ) => {
    // Clear existing timer
    if (refreshTimers.has(key)) {
      clearTimeout(refreshTimers.get(key));
    }

    // Setup new timer
    const timer = setInterval(async () => {
      try {
        await refreshData(key, refreshFunction, { maxRetries, retryDelay });
      } catch (error) {
        console.warn(`Auto-refresh failed for key: ${key}`, error);
      }
    }, interval);

    refreshTimers.set(key, timer);
  };

  /**
   * Remove specific cache entry
   */
  const remove = (key) => {
    // Clear refresh timer if exists
    if (refreshTimers.has(key)) {
      clearTimeout(refreshTimers.get(key));
      refreshTimers.delete(key);
    }

    // Clear retry counter
    retryCounters.delete(key);

    // Remove from cache
    removeCache(key);
    return { success: true, key };
  };

  /**
   * Clear all cache entries
   */
  const clear = () => {
    // Clear all refresh timers
    refreshTimers.forEach((timer) => clearTimeout(timer));
    refreshTimers.clear();
    retryCounters.clear();

    // Clear cache
    clearCache();
    return { success: true, message: "All cache cleared" };
  };

  /**
   * Invalidate cache by pattern or tags
   */
  const invalidate = (pattern, options = {}) => {
    const { clearTimers = true } = options;

    if (clearTimers) {
      // Clear refresh timers for matching keys
      refreshTimers.forEach((timer, key) => {
        if (typeof pattern === "string" && key.includes(pattern)) {
          clearTimeout(timer);
          refreshTimers.delete(key);
          retryCounters.delete(key);
        } else if (pattern instanceof RegExp && pattern.test(key)) {
          clearTimeout(timer);
          refreshTimers.delete(key);
          retryCounters.delete(key);
        }
      });
    }

    // Invalidate cache
    invalidateCache(pattern);
    return { success: true, pattern };
  };

  /**
   * Invalidate cache by tags
   */
  const invalidateByTagsCache = (tags, options = {}) => {
    const { clearTimers = true } = options;

    if (clearTimers) {
      // This is a simplified approach - in a real implementation,
      // we'd need to check which keys have these tags
      // For now, we'll clear all timers when invalidating by tags
      refreshTimers.forEach((timer) => clearTimeout(timer));
      refreshTimers.clear();
      retryCounters.clear();
    }

    // Invalidate by tags
    invalidateByTags(tags);
    return { success: true, tags };
  };

  /**
   * Get cache statistics
   */
  const stats = () => {
    return getCacheStats();
  };

  /**
   * Configure cache settings
   */
  const configure = (config) => {
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
  };

  /**
   * Check if data exists in cache
   */
  const exists = (key) => {
    const data = getCache(key);
    return data !== null;
  };

  /**
   * Get cache entry metadata
   */
  const getMetadata = (key) => {
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
  };

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

export default useVormiaCacheSvelte;
