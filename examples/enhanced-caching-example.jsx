import React, { useState, useEffect } from 'react';
import { useVormiaCache, useVormiaCacheVue, useVormiaCacheSvelte } from 'vormiaqueryjs';

/**
 * Enhanced Caching Example - React Version
 * Demonstrates all the new vormiaqueryjs-style caching features
 */
function EnhancedCachingExample() {
  const [userData, setUserData] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [refreshStatus, setRefreshStatus] = useState('');

  // Initialize cache with custom configuration
  const cache = useVormiaCache({
    defaultTTL: 1800000, // 30 minutes
    defaultPriority: 'high',
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
  });

  // Simulate API calls
  const fetchUserData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      lastLogin: new Date().toISOString(),
      preferences: { theme: 'dark', language: 'en' }
    };
  };

  const fetchUserPosts = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: 1, title: 'First Post', content: 'Hello World!' },
      { id: 2, title: 'Second Post', content: 'Another post' }
    ];
  };

  const fetchUserSettings = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      notifications: true,
      privacy: 'public',
      timezone: 'UTC'
    };
  };

  // Example 1: Basic caching operations
  const handleBasicCaching = async () => {
    console.log('=== Basic Caching Operations ===');

    // Store user data with custom TTL and priority
    const storeResult = cache.store('user:profile', await fetchUserData(), {
      ttl: 3600000, // 1 hour
      priority: 'high',
      tags: ['user', 'profile', 'auth']
    });
    console.log('Store result:', storeResult);

    // Get cached data
    const cachedData = cache.get('user:profile');
    console.log('Cached data:', cachedData);

    // Check if data exists
    const exists = cache.exists('user:profile');
    console.log('Data exists:', exists);

    // Get metadata about cache entry
    const metadata = cache.getMetadata('user:profile');
    console.log('Cache metadata:', metadata);

    setUserData(cachedData);
  };

  // Example 2: Advanced caching with auto-refresh
  const handleAdvancedCaching = async () => {
    console.log('=== Advanced Caching with Auto-Refresh ===');

    // Store posts with auto-refresh enabled
    const postsResult = cache.store('user:posts', await fetchUserPosts(), {
      ttl: 900000, // 15 minutes
      priority: 'normal',
      tags: ['user', 'posts', 'content'],
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      refreshFunction: fetchUserPosts,
      maxRetries: 2,
      retryDelay: 1000
    });
    console.log('Posts stored with auto-refresh:', postsResult);

    // Store settings with different configuration
    const settingsResult = cache.store('user:settings', await fetchUserSettings(), {
      ttl: 7200000, // 2 hours
      priority: 'low',
      tags: ['user', 'settings', 'preferences'],
      autoRefresh: false // No auto-refresh for settings
    });
    console.log('Settings stored:', settingsResult);
  };

  // Example 3: Manual refresh operations
  const handleManualRefresh = async () => {
    console.log('=== Manual Refresh Operations ===');

    setRefreshStatus('Refreshing...');

    // Refresh user profile data
    const refreshResult = await cache.refresh('user:profile', fetchUserData, {
      fallback: userData, // Use current data as fallback
      validate: (data) => data && data.id && data.name, // Validate data
      maxRetries: 2,
      retryDelay: 1500
    });

    console.log('Refresh result:', refreshResult);
    setRefreshStatus(`Refresh: ${refreshResult.success ? 'Success' : 'Failed'}`);

    if (refreshResult.success) {
      setUserData(refreshResult.data);
    }
  };

  // Example 4: Cache invalidation
  const handleCacheInvalidation = () => {
    console.log('=== Cache Invalidation ===');

    // Invalidate by pattern
    const patternResult = cache.invalidate('user:', { clearTimers: true });
    console.log('Pattern invalidation:', patternResult);

    // Invalidate by tags
    const tagsResult = cache.invalidateByTags(['auth', 'profile'], { clearTimers: true });
    console.log('Tags invalidation:', tagsResult);

    // Remove specific entry
    const removeResult = cache.remove('user:settings');
    console.log('Remove specific:', removeResult);

    setUserData(null);
  };

  // Example 5: Cache configuration and statistics
  const handleCacheManagement = () => {
    console.log('=== Cache Management ===');

    // Configure cache settings
    const configResult = cache.configure({
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 1800000, // 30 minutes
      maxItems: 500
    });
    console.log('Configuration result:', configResult);

    // Get cache statistics
    const stats = cache.stats();
    console.log('Cache statistics:', stats);
    setCacheStats(stats);
  };

  // Example 6: Smart caching with fallbacks
  const handleSmartCaching = async () => {
    console.log('=== Smart Caching with Fallbacks ===');

    // Try to get data with fallback
    const smartData = cache.get('user:posts', {
      fallback: [{ id: 0, title: 'Fallback Post', content: 'No data available' }],
      validate: (data) => Array.isArray(data) && data.length > 0,
      refresh: true,
      refreshFunction: fetchUserPosts
    });

    console.log('Smart cached data:', smartData);
  };

  // Example 7: Bulk operations
  const handleBulkOperations = async () => {
    console.log('=== Bulk Cache Operations ===');

    // Store multiple items
    const items = [
      { key: 'user:profile', data: await fetchUserData(), tags: ['user', 'profile'] },
      { key: 'user:posts', data: await fetchUserPosts(), tags: ['user', 'posts'] },
      { key: 'user:settings', data: await fetchUserSettings(), tags: ['user', 'settings'] }
    ];

    items.forEach(({ key, data, tags }) => {
      cache.store(key, data, { tags, priority: 'high' });
    });

    console.log('Bulk storage completed');
  };

  // Example 8: Cache lifecycle management
  const handleCacheLifecycle = () => {
    console.log('=== Cache Lifecycle Management ===');

    // Clear all cache
    const clearResult = cache.clear();
    console.log('Clear all:', clearResult);

    // Reset user data
    setUserData(null);
    setCacheStats(null);
    setRefreshStatus('');
  };

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = cache.stats();
      setCacheStats(stats);
    }, 5000);

    return () => clearInterval(interval);
  }, [cache]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Enhanced Caching with VormiaQueryJS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cache Operations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cache Operations</h2>
          
          <button
            onClick={handleBasicCaching}
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Basic Caching
          </button>
          
          <button
            onClick={handleAdvancedCaching}
            className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Advanced Caching
          </button>
          
          <button
            onClick={handleManualRefresh}
            className="w-full p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Manual Refresh
          </button>
          
          <button
            onClick={handleSmartCaching}
            className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Smart Caching
          </button>
        </div>

        {/* Cache Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cache Management</h2>
          
          <button
            onClick={handleCacheInvalidation}
            className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Invalidate Cache
          </button>
          
          <button
            onClick={handleCacheManagement}
            className="w-full p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Cache Stats
          </button>
          
          <button
            onClick={handleBulkOperations}
            className="w-full p-3 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Bulk Operations
          </button>
          
          <button
            onClick={handleCacheLifecycle}
            className="w-full p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Data Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Cached User Data</h3>
          {userData ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Last Login:</strong> {new Date(userData.lastLogin).toLocaleString()}</p>
              <p><strong>Theme:</strong> {userData.preferences?.theme}</p>
            </div>
          ) : (
            <p className="text-gray-500">No user data cached</p>
          )}
        </div>

        {/* Cache Statistics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Cache Statistics</h3>
          {cacheStats ? (
            <div className="space-y-2 text-sm">
              <p><strong>Total Items:</strong> {cacheStats.totalItems}</p>
              <p><strong>Total Size:</strong> {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Expired Items:</strong> {cacheStats.expiredItems}</p>
              <p><strong>Cache Efficiency:</strong> {(cacheStats.cacheEfficiency * 100).toFixed(1)}%</p>
              <p><strong>Last Cleanup:</strong> {new Date(cacheStats.lastCleanup).toLocaleTimeString()}</p>
            </div>
          ) : (
            <p className="text-gray-500">No cache statistics available</p>
          )}
        </div>
      </div>

      {/* Status Display */}
      {refreshStatus && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{refreshStatus}</p>
        </div>
      )}

      {/* Configuration Info */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Cache Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Default TTL:</strong><br />
            {Math.round(cache.defaultTTL / 1000 / 60)} minutes
          </div>
          <div>
            <strong>Priority:</strong><br />
            {cache.defaultPriority}
          </div>
          <div>
            <strong>Auto-Refresh:</strong><br />
            {cache.autoRefresh ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <strong>Refresh Interval:</strong><br />
            {Math.round(cache.refreshInterval / 1000 / 60)} minutes
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Usage Examples</h3>
        <div className="space-y-2 text-sm font-mono bg-gray-100 p-3 rounded">
          <p>// Store data with custom TTL and tags</p>
          <p>cache.store('user:profile', userData, {'{'}</p>
          <p>  ttl: 3600000, // 1 hour</p>
          <p>  priority: 'high',</p>
          <p>  tags: ['user', 'profile']</p>
          <p>{'}'});</p>
          <br />
          <p>// Get data with fallback and validation</p>
          <p>const data = cache.get('user:profile', {'{'}</p>
          <p>  fallback: defaultData,</p>
          <p>  validate: (data) => data && data.id</p>
          <p>{'}'});</p>
          <br />
          <p>// Refresh data with retry logic</p>
          <p>await cache.refresh('user:profile', fetchFunction, {'{'}</p>
          <p>  maxRetries: 3,</p>
          <p>  retryDelay: 1000</p>
          <p>{'}'});</p>
        </div>
      </div>
    </div>
  );
}

export default EnhancedCachingExample;
