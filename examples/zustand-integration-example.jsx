import React, { useState, useEffect } from 'react';
import { 
  VormiaProvider, 
  VormiaRouteGuard, 
  useVrmAuthEnhanced,
  useCacheStore,
  useStorageStore,
  useSettingsStore
} from 'vormiaqueryjs';

/**
 * Example: Enhanced Authentication with Zustand
 * Shows how to use the new enhanced auth hook
 */
const EnhancedAuthExample = () => {
  const {
    isAuthenticated,
    user,
    login,
    logout,
    hasPermission,
    hasRole,
    setUserPreference,
    getUserPreference,
    saveFormData,
    loadFormData,
    getSessionInfo
  } = useVrmAuthEnhanced();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    try {
      await login(credentials, {
        rememberMe: true,
        onSuccess: (data) => {
          console.log('Login successful:', data);
          // Save user preference
          setUserPreference('lastLogin', new Date().toISOString());
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout({
      clearCache: true,
      clearStorage: true,
      onSuccess: () => {
        console.log('Logout successful');
      }
    });
  };

  return (
    <div className="auth-example">
      <h3>Enhanced Authentication</h3>
      
      {!isAuthenticated ? (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <p>Welcome, {user?.name}!</p>
          <p>Roles: {user?.roles?.join(', ')}</p>
          <p>Permissions: {user?.permissions?.length}</p>
          
          <div>
            <h4>Permission Checks:</h4>
            <p>Can manage users: {hasPermission('manage_users') ? 'Yes' : 'No'}</p>
            <p>Is admin: {hasRole('admin') ? 'Yes' : 'No'}</p>
          </div>
          
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Route Protection with VormiaRouteGuard
 * Shows different ways to protect routes
 */
const RouteProtectionExample = () => {
  return (
    <div className="route-protection-example">
      <h3>Route Protection Examples</h3>
      
      {/* Basic role-based protection */}
      <VormiaRouteGuard roles={["admin"]} redirectTo="/unauthorized">
        <div className="admin-panel">
          <h4>Admin Panel</h4>
          <p>Only admins can see this content</p>
        </div>
      </VormiaRouteGuard>
      
      {/* Permission-based protection */}
      <VormiaRouteGuard permissions={["manage_users", "delete_posts"]} fallback={<AccessDenied />}>
        <div className="user-management">
          <h4>User Management</h4>
          <p>Users with manage_users AND delete_posts permissions can see this</p>
        </div>
      </VormiaRouteGuard>
      
      {/* Multiple roles (ANY role) */}
      <VormiaRouteGuard roles={["admin", "moderator"]} requireAll={false}>
        <div className="moderator-panel">
          <h4>Moderator Panel</h4>
          <p>Admins OR moderators can see this</p>
        </div>
      </VormiaRouteGuard>
      
      {/* Custom validation */}
      <VormiaRouteGuard 
        validate={(user) => user?.isVerified && user?.subscription === 'premium'}
        fallback={<UpgradeRequired />}
      >
        <div className="premium-features">
          <h4>Premium Features</h4>
          <p>Only verified premium users can see this</p>
        </div>
      </VormiaRouteGuard>
      
      {/* Non-strict mode (allows unauthenticated users) */}
      <VormiaRouteGuard strict={false} roles={["guest"]}>
        <div className="guest-content">
          <h4>Guest Content</h4>
          <p>Even unauthenticated users can see this</p>
        </div>
      </VormiaRouteGuard>
    </div>
  );
};

/**
 * Example: Cache Management
 * Shows how to use the cache store for offline data
 */
const CacheManagementExample = () => {
  const {
    setCache,
    getCache,
    invalidateCache,
    getCacheStats,
    clearCache
  } = useCacheStore();

  const [cacheKey, setCacheKey] = useState('');
  const [cacheValue, setCacheValue] = useState('');
  const [cacheStats, setCacheStats] = useState(null);

  const handleSetCache = () => {
    setCache(cacheKey, cacheValue, {
      ttl: 3600000, // 1 hour
      priority: 'high',
      tags: ['example', 'user-input']
    });
    setCacheValue('');
  };

  const handleGetCache = () => {
    const value = getCache(cacheKey);
    if (value !== null) {
      setCacheValue(JSON.stringify(value));
    } else {
      setCacheValue('Not found in cache');
    }
  };

  const handleGetStats = () => {
    setCacheStats(getCacheStats());
  };

  return (
    <div className="cache-example">
      <h3>Cache Management</h3>
      
      <div>
        <input
          placeholder="Cache Key"
          value={cacheKey}
          onChange={(e) => setCacheKey(e.target.value)}
        />
        <textarea
          placeholder="Cache Value (JSON)"
          value={cacheValue}
          onChange={(e) => setCacheValue(e.target.value)}
        />
        <button onClick={handleSetCache}>Set Cache</button>
        <button onClick={handleGetCache}>Get Cache</button>
        <button onClick={handleGetStats}>Get Stats</button>
        <button onClick={() => invalidateCache('example')}>Clear Example Cache</button>
        <button onClick={clearCache}>Clear All Cache</button>
      </div>
      
      {cacheStats && (
        <div className="cache-stats">
          <h4>Cache Statistics</h4>
          <p>Total Items: {cacheStats.totalItems}</p>
          <p>Total Size: {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
          <p>Expired Items: {cacheStats.expiredItems}</p>
          <p>Cache Efficiency: {(cacheStats.cacheEfficiency * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Storage Management
 * Shows how to use the storage store for user preferences
 */
const StorageManagementExample = () => {
  const {
    setUserPreference,
    getUserPreference,
    setFormData,
    getFormData,
    addSearchHistory,
    getSearchHistory,
    clearSearchHistory
  } = useStorageStore();

  const [prefKey, setPrefKey] = useState('');
  const [prefValue, setPrefValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSetPreference = () => {
    setUserPreference(prefKey, prefValue);
    setPrefValue('');
  };

  const handleGetPreference = () => {
    const value = getUserPreference(prefKey);
    setPrefValue(value !== null ? JSON.stringify(value) : 'Not found');
  };

  const handleAddSearch = () => {
    addSearchHistory(searchQuery, 'general');
    setSearchQuery('');
    // Refresh search history
    setSearchHistory(getSearchHistory('general', 10));
  };

  const handleLoadSearchHistory = () => {
    setSearchHistory(getSearchHistory('general', 10));
  };

  return (
    <div className="storage-example">
      <h3>Storage Management</h3>
      
      <div>
        <h4>User Preferences</h4>
        <input
          placeholder="Preference Key"
          value={prefKey}
          onChange={(e) => setPrefKey(e.target.value)}
        />
        <input
          placeholder="Preference Value"
          value={prefValue}
          onChange={(e) => setPrefValue(e.target.value)}
        />
        <button onClick={handleSetPreference}>Set Preference</button>
        <button onClick={handleGetPreference}>Get Preference</button>
      </div>
      
      <div>
        <h4>Search History</h4>
        <input
          placeholder="Search Query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleAddSearch}>Add Search</button>
        <button onClick={handleLoadSearchHistory}>Load History</button>
        <button onClick={() => {
          clearSearchHistory('general');
          setSearchHistory([]);
        }}>Clear History</button>
        
        {searchHistory.length > 0 && (
          <ul>
            {searchHistory.map((item, index) => (
              <li key={index}>
                {item.query} - {new Date(item.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * Example: Settings Management
 * Shows how to use the settings store for app configuration
 */
const SettingsManagementExample = () => {
  const {
    theme,
    setTheme,
    colorScheme,
    setColorScheme,
    notifications,
    updateNotificationSettings,
    performance,
    updatePerformanceSettings,
    exportSettings,
    importSettings
  } = useSettingsStore();

  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const exported = exportSettings(['theme', 'notifications']);
    console.log('Exported settings:', exported);
    // In a real app, you might download this as a file
  };

  const handleImport = () => {
    try {
      const success = importSettings(importData, { overwrite: false });
      if (success) {
        alert('Settings imported successfully!');
        setImportData('');
      } else {
        alert('Failed to import settings');
      }
    } catch (error) {
      alert('Invalid settings data');
    }
  };

  return (
    <div className="settings-example">
      <h3>Settings Management</h3>
      
      <div>
        <h4>Theme Settings</h4>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
        
        <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="red">Red</option>
        </select>
      </div>
      
      <div>
        <h4>Notification Settings</h4>
        <label>
          <input
            type="checkbox"
            checked={notifications.enabled}
            onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
          />
          Enable Notifications
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={notifications.sound}
            onChange={(e) => updateNotificationSettings({ sound: e.target.checked })}
          />
          Sound
        </label>
        
        <select
          value={notifications.position}
          onChange={(e) => updateNotificationSettings({ position: e.target.value })}
        >
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
        </select>
      </div>
      
      <div>
        <h4>Performance Settings</h4>
        <label>
          <input
            type="checkbox"
            checked={performance.cacheEnabled}
            onChange={(e) => updatePerformanceSettings({ cacheEnabled: e.target.checked })}
          />
          Enable Caching
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={performance.offlineMode}
            onChange={(e) => updatePerformanceSettings({ offlineMode: e.target.checked })}
          />
          Offline Mode
        </label>
      </div>
      
      <div>
        <h4>Import/Export</h4>
        <button onClick={handleExport}>Export Settings</button>
        <textarea
          placeholder="Paste settings JSON here"
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
        />
        <button onClick={handleImport}>Import Settings</button>
      </div>
    </div>
  );
};

// Fallback components for route protection
const AccessDenied = () => (
  <div className="access-denied">
    <h4>Access Denied</h4>
    <p>You don't have permission to view this content.</p>
  </div>
);

const UpgradeRequired = () => (
  <div className="upgrade-required">
    <h4>Upgrade Required</h4>
    <p>Please upgrade to premium to access this content.</p>
  </div>
);

/**
 * Main App Component
 * Shows all the new features in action
 */
const ZustandIntegrationApp = () => {
  return (
    <VormiaProvider
      config={{
        baseURL: 'https://api.vormia.com',
        debug: true,
        // New Zustand-powered configuration options
        storage: {
          strategy: 'localStorage',
          encryption: true,
          compression: true,
          maxSize: '50MB'
        },
        cache: {
          strategy: 'aggressive',
          maxAge: 3600000,
          maxSize: '100MB',
          offlineFirst: true
        },
        auth: {
          autoRefresh: true,
          refreshThreshold: 300000,
          multipleTabs: true,
          secureStorage: true
        }
      }}
    >
      <div className="zustand-integration-app">
        <h1>VormiaQueryJS + Zustand Integration</h1>
        <p>Showcasing all the new features powered by Zustand</p>
        
        <EnhancedAuthExample />
        <RouteProtectionExample />
        <CacheManagementExample />
        <StorageManagementExample />
        <SettingsManagementExample />
      </div>
    </VormiaProvider>
  );
};

export default ZustandIntegrationApp;
