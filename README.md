# VormiaQueryJS

A powerful, framework-agnostic query and mutation library with built-in error handling, notifications, and debug capabilities.

## 📦 **Required Peer Dependencies**

Before installing `vormiaqueryjs`, you must install the correct peer dependencies for your framework:

- **React**: `@tanstack/react-query`
- **Vue**: `@tanstack/vue-query`
- **Svelte**: `@tanstack/svelte-query`
- **Solid**: `@tanstack/solid-query`
- **Qwik**: `@builder.io/qwik`
- **Astro**: `@tanstack/react-query` + `react react-dom`
- **Common**: `axios` (required for all frameworks)
- **State Management**: `zustand` (required for advanced features)

---

## 🚀 Installation

Install VormiaQueryJS using your favorite package manager:

```bash
npm install vormiaqueryjs
# or
bun add vormiaqueryjs
# or
pnpm add vormiaqueryjs
# or
yarn add vormiaqueryjs
```

> **🌐 Browser Compatibility**: VormiaQueryJS is designed for **browser environments** and uses ESM modules for optimal compatibility with modern bundlers like Vite, Webpack, and Rollup. It does not support Node.js environments.

---

## 📥 **Import Structure**

VormiaQueryJS uses **framework-specific adapters** to prevent dependency resolution conflicts. Choose the correct import path for your framework:

### **Core Package (Framework-Agnostic)**
```javascript
import { createVormiaClient, HttpMethod } from "vormiaqueryjs";
```

### **React Framework**
```javascript
import { useVormiaQuery, VormiaProvider } from "vormiaqueryjs/react";
import { useVrmAuthEnhanced } from "vormiaqueryjs/react";
```

### **Vue Framework**
```javascript
import { useVormia } from "vormiaqueryjs/vue";
import { useVrmAuthEnhancedVue } from "vormiaqueryjs/vue";
```

### **Svelte Framework**
```javascript
import { vormiaStore } from "vormiaqueryjs/svelte";
import { useVrmAuthEnhancedSvelte } from "vormiaqueryjs/svelte";
```

### **Solid Framework**
```javascript
import { createVormiaResource } from "vormiaqueryjs/solid";
```

### **Qwik Framework**
```javascript
import { useVormia } from "vormiaqueryjs/qwik";
```

> **⚠️ Important**: Always use the framework-specific import path to avoid dependency resolution errors. The main package only exports framework-agnostic utilities.

---

## 📘 **TypeScript Support**

VormiaQueryJS includes **complete TypeScript definitions** for all functions, hooks, components, and types. No additional `@types` package is required!

### **Automatic Type Detection**

TypeScript will automatically detect the types when you import from `vormiaqueryjs`:

```typescript
// Core functionality - Framework-agnostic
import {
  createVormiaClient,
  HttpMethod,
} from "vormiaqueryjs";

// React-specific functionality
import {
  useVormiaQuery,
  VormiaConfig,
  VormiaError,
  VormiaProvider,
} from "vormiaqueryjs/react";

// Full type safety for configuration
const config: VormiaConfig = {
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer token" },
  withCredentials: true,
  debug: true,
};

// Type-safe query options
const queryOptions = {
  endpoint: "/api/users",
  method: HttpMethod.GET,
  params: { page: 1, limit: 10 },
  showDebug: true,
};

// Generic types for response data
const { data, isLoading, error } = useVormiaQuery<User[]>(queryOptions);
```

### **Available Types**

- **Core Types**: `VormiaConfig`, `VormiaQueryOptions`, `VormiaResponse<T>`, `HttpMethod`
- **Error Types**: `VormiaError` class with utility methods
- **Hook Types**: Full typing for all query and mutation hooks
- **Component Types**: `VormiaProviderProps` and other component interfaces

### **Error Handling with Types**

```typescript
import { VormiaError } from "vormiaqueryjs";

if (error instanceof VormiaError) {
  // Type-safe error handling
  if (error.isValidationError()) {
    const validationErrors = error.getValidationErrors();
    // validationErrors is properly typed
  }

  if (error.isNetworkError()) {
    // Handle network errors
  }

  // Get user-friendly message
  const userMessage = error.getUserMessage();
}
```

See the [TypeScript example](./examples/typescript-example.ts) for more detailed usage patterns.

---

## ⚙️ Configuration

### **Environment Variables**

Configure your package using environment variables in your `.env` file:

```bash
# Required
VITE_VORMIA_API_URL=https://api.example.com

# Debug System (Single Control)
VITE_VORMIA_DEBUG=true                  # true = development mode, false = production mode

# Advanced Configuration (Optional)
VITE_VORMIA_AUTH_TOKEN_KEY=vormia_auth_token  # Custom auth token storage key
VITE_VORMIA_TIMEOUT=30000                     # Request timeout in milliseconds
VITE_VORMIA_WITH_CREDENTIALS=false            # Include credentials in requests
```

**⚠️ Important**: All environment variables must start with `VITE_` prefix to be accessible in the browser.

**🎯 Environment Variable Simplification**: We removed the redundant `VITE_VORMIA_ENV` variable. Now `VITE_VORMIA_DEBUG` serves as both the debug toggle and environment indicator:

- `VITE_VORMIA_DEBUG=true` = Development mode (show debug info)
- `VITE_VORMIA_DEBUG=false` = Production mode (hide debug info)

**🔔 Notification System**: Notifications are automatically shown for all queries and mutations. The `showDebug` option controls debug panel visibility and respects the `VITE_VORMIA_DEBUG` environment variable.

---

## ✨ **Package Core Features**

### 🚀 **Core Features**

- **🔐 Comprehensive Authentication System**: `useVormiaAuth` hook with permission and role checking
- **🔑 Permission Management**: `hasPermission()`, `hasAnyPermission()`, and resource access control
- **👤 Role-Based Access**: `isUser()`, `isAdmin()`, `isModerator()` and more role helpers
- **📋 Resource Access Control**: `canCreate()`, `canRead()`, `canUpdate()`, `canDelete()` helpers
- **Notifications Always Enabled**: Notifications are automatically shown for all queries and mutations
- **Enhanced Debug Panel**: Better error/success response display with improved structure detection
- **Cleaner API**: Simplified hook usage with sensible defaults
- **Form Data Transformation**: Automatic field mapping and transformation for API requests
- **📘 Full TypeScript Support**: Complete type definitions for all functions, hooks, and components

### 🎨 **Notification System**

- **Solid Background Colors**: Professional appearance with `bg-*-500` colors for maximum visibility
- **Perfect Contrast**: Pure black/white combinations for optimal readability
- **CSS Fallback**: Guaranteed styling even when Tailwind JIT compilation fails
- **Hidden Icons**: Clean, minimalist design without visual clutter
- **Multiple Variants**: Toast, banner, modal, and in-app notification styles
- **Auto-dismiss**: Configurable duration and manual close options

### 🔧 **Advanced Features**

- **Custom Error Labels**: Personalized error logging with `errorLabel` option
- **Environment Detection**: Automatic debug mode based on `VITE_VORMIA_DEBUG`
- **Error Handling**: Comprehensive error management with field-specific validation
- **Debug Logging**: Detailed console output for development and troubleshooting
- **Framework Support**: React, Vue, Svelte, Solid, Qwik, and Astro adapters

### 🏷️ **Custom Error Labels**

Personalize your error logging with custom labels for better debugging:

```javascript
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  errorLabel: "Registration Error", // 🏷️ Custom error label!
  showDebug: true,
  // ... rest of config
});
```

**Console Output**: Shows " Registration Error" instead of generic " Mutation Error" for better identification.

### 🎯 **SimpleNotification Component**

The `SimpleNotification` component provides a clean, consistent way to display notifications without manual HTML styling:

```jsx
// ✅ Recommended: Use SimpleNotification
{
  generalError && (
    <SimpleNotification
      type="error"
      title="Error"
      message={generalError}
      onClose={() => setGeneralError("")}
      className="mb-4"
    />
  );
}
```

**Available Types**: `success`, `error`, `warning`, `info`, `announce`

**🎨 Notification Styling**: All notification types use solid background colors with perfect contrast:

| Type         | Background      | Text         | Border              | Description                                         |
| ------------ | --------------- | ------------ | ------------------- | --------------------------------------------------- |
| **Success**  | `bg-green-500`  | `text-white` | `border-green-200`  | Professional green with white text                  |
| **Error**    | `bg-red-500`    | `text-white` | `border-red-200`    | Clear red with white text                           |
| **Warning**  | `bg-yellow-500` | `text-white` | `border-yellow-200` | Bright yellow with white text                       |
| **Info**     | `bg-blue-500`   | `text-white` | `border-blue-200`   | Trusted blue with white text                        |
| **Announce** | `bg-black`      | `text-white` | `border-gray-200`   | **Pure black with white text for maximum contrast** |

**CSS Fallback**: Guaranteed styling even when Tailwind JIT compilation fails.

**🛡️ Reliability Features:**

- **Dual-Class System**: Tailwind + CSS fallback classes
- **Guaranteed Styling**: CSS with `!important` ensures notifications always work
- **Perfect Contrast**: All combinations meet WCAG accessibility standards
- **Framework Agnostic**: Works consistently across all supported frameworks

---

## 🌟 Core Features

### **🚀 What VormiaQueryJS Offers:**

- **🔒 Authentication System**: Built-in token management with automatic request handling
- **🔄 Form Data Transformation**: Automatically rename, add, and remove fields before sending to API
- **🔔 Smart Notifications**: Toast, banner, in-app, and modal notifications with success/error/warning/info types
- **🐛 Debug System**: Environment-aware debug panel with comprehensive logging
- **🌍 Cross-Framework**: Works with React, Vue, Svelte, Solid, Qwik, and Astro
- **⚡ Performance**: Built on TanStack Query for optimal caching and state management
- **🔄 HTTP Client**: Robust HTTP client with comprehensive response handling including 204 No Content support
- **🚀 Enhanced Caching**: Advanced caching system with auto-refresh, retry logic, and smart fallbacks

### **🔄 HTTP Client & Response Handling**

VormiaQueryJS includes a robust HTTP client that handles all response types gracefully:

#### **204 No Content Response Support**

The client automatically handles 204 No Content responses, which are common in:

- **Logout endpoints** - Often return 204 when successful
- **Delete operations** - Usually return 204 after successful deletion
- **Update operations** - Sometimes return 204 when no content needed
- **Status changes** - Like activating/deactivating resources

```javascript
import { createVormiaClient } from "vormiaqueryjs";

const client = createVormiaClient({
  baseURL: "https://api.example.com",
});

// 204 responses are handled automatically
const logoutResponse = await client.post("/api/auth/logout");
console.log(logoutResponse.status); // 204
console.log(logoutResponse.data); // { message: "Success - No content returned" }

// Delete operations with 204
const deleteResponse = await client.delete("/api/users/123");
if (deleteResponse.status === 204) {
  console.log("User deleted successfully");
}

// PUT/PATCH operations with 204
const updateResponse = await client.put("/api/resource/123", {
  name: "Updated",
});
if (updateResponse.status === 204) {
  console.log("Resource updated successfully");
}
```

#### **Robust Response Handling**

- **Automatic Detection**: Detects 204/205 status codes automatically
- **Graceful Fallbacks**: Handles JSON parsing failures gracefully
- **Universal Support**: Works across all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Error Resilience**: Continues working even with malformed responses
- **Framework Agnostic**: Consistent behavior across all supported frameworks

#### **Response Types Supported**

| Status Code           | Description         | Handling                              |
| --------------------- | ------------------- | ------------------------------------- |
| **200-299**           | Success responses   | JSON parsed automatically             |
| **204**               | No Content          | Special handling with success message |
| **205**               | Reset Content       | Special handling with success message |
| **4xx/5xx**           | Error responses     | Wrapped in VormiaError with details   |
| **Network Errors**    | Connection issues   | Graceful error handling               |
| **JSON Parse Errors** | Malformed responses | Fallback with descriptive messages    |

### **🆕 New Zustand-Powered Features:**

- **🏗️ Centralized State Management**: Zustand-powered stores for auth, cache, storage, and settings
- **🛡️ Route Protection**: Declarative route protection with `VormiaRouteGuard` component
- **📱 Offline Support**: Smart caching with offline data persistence and background sync
- **💾 Local Storage**: User preferences, app settings, and form data persistence
- **🔄 Token Management**: Automatic token refresh, secure storage, and cross-tab synchronization
- **⚡ Performance Optimization**: Intelligent cache invalidation, size management, and cleanup strategies
- **🔐 Enhanced Security**: Secure storage strategies and automatic token expiry handling
- **🛡️ Error Handling**: Comprehensive error parsing and field-level error mapping
- **🧪 Tested**: Modern testing with Vitest for reliability
- **🔄 Cross-Tab Sync**: State automatically synchronizes across browser tabs
- **📊 Smart Caching**: Intelligent cache management with tags, expiration, and size limits
- **🎨 Theme Management**: Dynamic theme switching with persistent user preferences
- **🔔 Enhanced Notifications**: Persistent notification preferences and settings

### **📦 Components & Hooks Available:**

**Core Components:**

- `VormiaProvider` - Essential configuration provider
- `NotificationPanel` - Advanced notification system
- `SimpleNotification` - Easy drop-in notifications
- `ErrorDebugPanel` - Debug information display

**Query Hooks:**

- `useVormiaQuery` - Basic queries (no auth required)
- `useVormiaQueryAuth` - Authenticated queries
- `useVormiaQueryAuthMutation` - Authenticated mutations with form transformation
- `useVormiaQuerySimple` - Flexible testing queries

**Utility Hooks:**

- `useVormiaConfig` - Dynamic configuration management
- `useVormiaAuth` - Comprehensive authentication and authorization helpers
- `useVrmAuthEnhanced` - Enhanced authentication with Zustand stores
- `useVrmQuery` - Legacy query support
- `useVrmMutation` - Legacy mutation support

**Enhanced Caching Hooks:**

- `useVormiaCache` - React enhanced caching with auto-refresh and smart fallbacks
- `useVormiaCacheVue` - Vue.js enhanced caching with auto-refresh and smart fallbacks
- `useVormiaCacheSvelte` - Svelte enhanced caching with auto-refresh and smart fallbacks

**Zustand Stores:**

- `useAuthStore` - Centralized authentication state management
- `useCacheStore` - Offline data caching and persistence
- `useStorageStore` - Local data storage and user preferences
- `useSettingsStore` - Application-wide configuration and settings

---

## 🏗️ Core Components

### **VormiaProvider** - Essential Configuration Provider

**Why VormiaProvider is Critical:**
The `VormiaProvider` sets up the foundation for your entire application. It's essential to configure the correct `baseURL` because:

- **🌐 API Routing**: All requests will be made to this base URL
- **🔒 Authentication**: Token storage and request headers are configured here
- **⚡ Performance**: Connection pooling and timeout settings are established
- **🛡️ Security**: CORS and credentials settings are configured

```jsx
import { VormiaProvider } from "vormiaqueryjs/react";

function App() {
  return (
    <VormiaProvider
      config={{
        baseURL: import.meta.env.VITE_VORMIA_API_URL,
        // New Zustand-powered configuration options
        enableZustand: true, // Enable Zustand stores
        persistAuth: true, // Persist authentication state
        persistCache: true, // Persist cache data
        persistStorage: true, // Persist user preferences
        persistSettings: true, // Persist app settings
        // Cache configuration
        cacheConfig: {
          maxSize: 100, // Maximum cache items
          maxAge: 3600000, // 1 hour cache expiry
          enableOfflineQueue: true, // Queue requests when offline
        },
        // Storage configuration
        storageConfig: {
          encryption: false, // Enable encryption for sensitive data
          compression: true, // Enable data compression
          maxSize: 50 * 1024 * 1024, // 50MB storage limit
        },
      }}
    >
      <YourApp />
    </VormiaProvider>
  );
}
```

### **NotificationPanel** - Advanced Notification System

```jsx
import { NotificationPanel } from "vormiaqueryjs/react";

function MyComponent() {
  const [notification, setNotification] = useState(null);

  return (
    <div>
      {notification && (
        <NotificationPanel
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
```

### **SimpleNotification** - Easy Drop-in Component

````jsx
import { SimpleNotification } from "vormiaqueryjs/react";

function MyComponent() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [info, setInfo] = useState(null);

  return (
    <div>
      {/* Easy error display - matches your exact styling */}
      <SimpleNotification
        type="error"
        message={error}
        onClose={() => setError(null)}
      />

      {/* Easy success display */}
      <SimpleNotification
        type="success"
        message={success}
        onClose={() => setSuccess(null)}
      />

      {/* Info notification */}
      <SimpleNotification
        type="info"
        message={info}
        onClose={() => setInfo(null)}
      />
    </div>
  );
}

### **ErrorDebugPanel** - Debug Information

```jsx
import { ErrorDebugPanel } from "vormiaqueryjs/react";

function MyComponent() {
  const [debugInfo, setDebugInfo] = useState(null);

  return (
    <div>
      <ErrorDebugPanel
        debugInfo={debugInfo}
        showDebug={true}
        onClose={() => setDebugInfo(null)}
      />
    </div>
  );
}
````

---

## 🎯 Available Hooks

### **1. useVormiaQuery** - Basic Query (No Auth)

```jsx
import { useVormiaQuery } from "vormiaqueryjs/react";

const query = useVormiaQuery({
  endpoint: "/public/data",
  method: "GET",
  showDebug: true, // Override debug panel visibility
});
```

### **2. useVormiaQueryAuth** - Authenticated Query

```jsx
import { useVormiaQueryAuth } from "vormiaqueryjs/react";

const query = useVormiaQueryAuth({
  endpoint: "/user/profile",
  method: "GET",
  showDebug: true, // Override debug panel visibility
});
```

### **3. useVormiaQueryAuthMutation** - Authenticated Mutation with Form Transformation

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs/react";

const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  method: "POST",
  showDebug: true, // Override debug panel visibility
  formdata: {
    rename: {
      confirmPassword: "password_confirmation",
      user_name: "name",
    },
    add: {
      terms: true,
      source: "web",
    },
    remove: ["confirmPassword", "tempField"],
  },
});
```

### **4. useVormiaQuerySimple** - Flexible Testing Query

```jsx
import { useVormiaQuerySimple } from "vormiaqueryjs/react";

const query = useVormiaQuerySimple({
  endpoint: "/test-endpoint",
  method: "POST",
  data: { test: "data" },
  showDebug: true, // Override debug panel visibility
});
```

### **5. Legacy Hooks (Backward Compatibility)**

```jsx
import { useVrmQuery, useVrmMutation } from "vormiaqueryjs/react";

// Legacy query hook
const query = useVrmQuery({
  endpoint: "/legacy/endpoint",
  method: "GET",
});

// Legacy mutation hook
const mutation = useVrmMutation({
  endpoint: "/legacy/endpoint",
  method: "POST",
  data: { legacy: "data" },
});
```

---

## 🔐 **Authentication & Authorization System**

VormiaQueryJS provides a comprehensive authentication and authorization system with easy-to-use helpers for permission checking and role management.

### **🚀 Authentication Helpers**

```javascript
import { useVormiaAuth } from "vormiaqueryjs/react";

const auth = useVormiaAuth();

// Basic authentication
const isLoggedIn = auth.isAuthenticated();
const user = auth.getUser();

// Store user data after login
auth.setUser({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  permissions: ["view_reports", "add_users"],
  roles: ["user", "moderator"],
});

// Clear user data on logout
auth.clearUser();
```

### **🔑 Permission Checking**

```javascript
// Check single permission
const canViewReports = auth.hasPermission("view_reports");

// Check multiple permissions (ALL must be present)
const canManageUsers = auth.hasPermission(["manage_users", "user_management"]);

// Check if user has ANY of the specified permissions
const hasAnyPermission = auth.hasAnyPermission(["view_reports", "add_users"]);

// Get all user permissions
const permissions = auth.getPermissions();
```

### **👤 Role Checking**

```javascript
// Check single role
const isAdmin = auth.isUser("Admin");

// Check multiple roles (ANY can be present)
const isModerator = auth.isUser(["moderator", "Mod"]);

// Check if user has ALL specified roles
const hasAllRoles = auth.hasAllRoles(["user", "verified"]);

// Common role checks
const isAdmin = auth.isAdmin();
const isModerator = auth.isModerator();
const isSuperUser = auth.isSuperUser();

// Get all user roles
const roles = auth.getRoles();
```

### **📋 Resource Access Control**

```javascript
// CRUD operations
const canCreateUsers = auth.canCreate("users");
const canReadReports = auth.canRead("reports");
const canUpdateProfile = auth.canUpdate("profile");
const canDeletePosts = auth.canDelete("posts");

// Custom resource access
const canAccess = auth.canAccess("reports", "export");

// Common permission checks
const canManageUsers = auth.canManageUsers();
const canViewReports = auth.canViewReports();
const canAddUsers = auth.canAddUsers();
```

### **🎯 Conditional Rendering Example**

```jsx
function AdminPanel() {
  const auth = useVormiaAuth();

  return (
    <div>
      {auth.isAuthenticated() && (
        <>
          {auth.canViewReports() && <button>View Reports</button>}
          {auth.canAddUsers() && <button>Add New User</button>}
          {auth.isAdmin() && <button>Admin Panel</button>}
        </>
      )}
    </div>
  );
}
```

### **🔗 Integration with Existing Hooks**

```javascript
function ProfileUpdate() {
  const auth = useVormiaAuth();
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/api/update-profile",
    method: "PUT",
    onSuccess: (data) => {
      // Update local user data after successful update
      auth.setUser(data.data.user);
    },
  });

  const handleUpdate = (profileData) => {
    // Check permissions before allowing update
    if (!auth.canUpdate("profile")) {
      alert("You do not have permission to update profiles");
      return;
    }

    mutation.mutate(profileData);
  };

  return (
    <button
      onClick={() => handleUpdate({ name: "New Name" })}
      disabled={!auth.canUpdate("profile")}
    >
      Update Profile
    </button>
  );
}
```

### **🚀 Enhanced Authentication with Zustand**

The new `useVrmAuthEnhanced` hook provides advanced authentication features powered by Zustand stores. It's available for React, Vue.js, and Svelte:

#### **React Usage**

```javascript
import { useVrmAuthEnhanced } from "vormiaqueryjs/react";

function EnhancedAuthExample() {
  const auth = useVrmAuthEnhanced();
  // ... rest of implementation
}
```

#### **Vue.js Usage**

```javascript
import { useVrmAuthEnhancedVue } from "vormiaqueryjs/vue";

export default {
  setup() {
    const auth = useVrmAuthEnhancedVue();
    // ... rest of implementation
  },
};
```

#### **Svelte Usage**

```javascript
import { useVrmAuthEnhancedSvelte } from "vormiaqueryjs/svelte";

const auth = useVrmAuthEnhancedSvelte();
// ... rest of implementation
```

```javascript
import { useVrmAuthEnhanced } from "vormiaqueryjs/react";

function EnhancedAuthExample() {
  const auth = useVrmAuthEnhanced();

  // Enhanced authentication with automatic token management
  const handleLogin = async (credentials) => {
    const result = await auth.login(credentials);

    // Handle different response types including 204 No Content
    if (result.status === 204) {
      console.log("Operation completed successfully (204 No Content)");
      return;
    }

    if (result.success) {
      // Token automatically stored and managed
      // User data automatically cached
      // Offline queue automatically processed
    }
  };

  // Automatic token refresh
  const ensureValidToken = async () => {
    const isValid = await auth.ensureValidToken();
    if (!isValid) {
      // Redirect to login or refresh token
    }
  };

  // User preferences with persistence
  const setTheme = (theme) => {
    auth.setUserPreference("theme", theme);
    // Automatically saved and synced across tabs
  };

  // Form data persistence
  const saveForm = (formData) => {
    auth.saveFormData("profile-form", formData);
    // Automatically restored on page reload
  };

  return (
    <div>
      <button
        onClick={async () => {
          await auth.logout();
          // Logout automatically handles 204 responses from logout endpoints
        }}
      >
        Logout
      </button>
      <button onClick={() => setTheme("dark")}>Dark Theme</button>
    </div>
  );
}
```

### **📱 Offline-First Data Management**

```javascript
import { useCacheStore, useStorageStore } from "vormiaqueryjs/react";

function OfflineExample() {
  const cache = useCacheStore();
  const storage = useStorageStore();

  // Cache data with tags for smart invalidation
  const cacheUserData = (userData) => {
    cache.setCache("user-profile", userData, {
      tags: ["user", "profile"],
      maxAge: 3600000, // 1 hour
    });
  };

  // Add to offline queue when network is down
  const queueRequest = (request) => {
    cache.addToOfflineQueue({
      type: "POST",
      endpoint: "/api/update",
      data: request,
      retryCount: 3,
    });
  };

  // Persistent user preferences
  const savePreferences = (prefs) => {
    storage.setUserPreference("notifications", prefs);
    // Automatically synced across tabs
  };

  return (
    <div>
      <button onClick={() => cache.clearCache()}>Clear Cache</button>
      <button onClick={() => storage.exportData()}>Export Data</button>
    </div>
  );
}
```

---

## 🚀 Enhanced Caching with useVormiaCache

VormiaQueryJS now includes powerful enhanced caching hooks that provide a `vormiaqueryjs`-style API for advanced caching operations. These hooks wrap the underlying Zustand stores and offer features like auto-refresh, retry logic, data validation, and smart fallbacks.

### **🆕 New Enhanced Caching Hooks**

**Available for all frameworks:**

- **React**: `useVormiaCache`
- **Vue.js**: `useVormiaCacheVue`
- **Svelte**: `useVormiaCacheSvelte`

### **🌟 Key Features**

- **⏰ Configurable TTL**: Set custom expiration times for different data types
- **🔄 Auto-Refresh**: Automatic background refreshing of cached data
- **🔄 Manual Refresh**: On-demand data refresh with retry logic
- **🏷️ Tag-Based Invalidation**: Remove cache entries by tags
- **📊 Smart Fallbacks**: Provide fallback data when cache misses occur
- **✅ Data Validation**: Validate cached data before returning
- **📈 Priority Management**: High/medium/low priority for cache cleanup
- **🔄 Retry Logic**: Exponential backoff for failed refresh operations
- **📱 Offline Support**: Cache persists across browser sessions

### **📱 React Usage**

```jsx
import { useVormiaCache } from "vormiaqueryjs/react";

function UserProfile() {
  const cache = useVormiaCache({
    defaultTTL: 1800000, // 30 minutes default
    defaultPriority: "high", // High priority by default
    autoRefresh: true, // Enable auto-refresh
    refreshInterval: 300000, // 5 minutes refresh interval
    maxRetries: 3, // Retry failed refreshes
    retryDelay: 1000, // 1 second base delay
  });

  // Store user data with auto-refresh
  const storeUserData = async () => {
    const userData = await fetchUserData();

    cache.store("user:profile", userData, {
      ttl: 3600000, // 1 hour TTL
      priority: "high", // High priority
      tags: ["user", "profile"], // Tag for invalidation
      autoRefresh: true, // Enable auto-refresh
      refreshInterval: 300000, // 5 minutes
      refreshFunction: fetchUserData, // Function to refresh data
      maxRetries: 2, // Custom retry count
      retryDelay: 1500, // Custom retry delay
    });
  };

  // Get data with fallback and validation
  const getUserData = () => {
    return cache.get("user:profile", {
      fallback: defaultUserData, // Fallback if cache miss
      validate: (data) => data && data.id, // Validate data integrity
      refresh: true, // Trigger refresh if data exists
      refreshFunction: fetchUserData, // Function to refresh
    });
  };

  // Manual refresh with retry logic
  const refreshUserData = async () => {
    const result = await cache.refresh("user:profile", fetchUserData, {
      fallback: getUserData(), // Use current data as fallback
      validate: (data) => data && data.id, // Validate new data
      maxRetries: 3, // Retry up to 3 times
      retryDelay: 2000, // 2 second base delay
    });

    if (result.success) {
      console.log("Data refreshed successfully");
    } else if (result.retryCount > 0) {
      console.log(`Retrying... (${result.retryCount} attempts left)`);
    }
  };

  // Invalidate cache by pattern or tags
  const clearUserCache = () => {
    // Remove all user-related cache entries
    cache.invalidate("user:", { clearTimers: true });

    // Remove all profile-tagged entries
    cache.invalidateByTags(["profile"], { clearTimers: true });
  };

  // Get cache statistics
  const showCacheStats = () => {
    const stats = cache.stats();
    console.log("Cache Statistics:", {
      totalItems: stats.totalItems,
      totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
      cacheEfficiency: `${(stats.cacheEfficiency * 100).toFixed(1)}%`,
      expiredItems: stats.expiredItems,
    });
  };

  // Configure cache settings
  const configureCache = () => {
    cache.configure({
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 7200000, // 2 hours
      maxItems: 1000, // Maximum 1000 items
    });
  };

  return (
    <div>
      <button onClick={storeUserData}>Store User Data</button>
      <button onClick={refreshUserData}>Refresh Data</button>
      <button onClick={clearUserCache}>Clear Cache</button>
      <button onClick={showCacheStats}>Show Stats</button>
      <button onClick={configureCache}>Configure Cache</button>

      <div>
        <h3>User Data:</h3>
        <pre>{JSON.stringify(getUserData(), null, 2)}</pre>
      </div>
    </div>
  );
}
```

### **🎯 Vue.js Usage**

```javascript
import { useVormiaCacheVue } from "vormiaqueryjs/vue";

export default {
  setup() {
    const cache = useVormiaCacheVue({
      defaultTTL: 1800000,
      autoRefresh: true,
      refreshInterval: 300000,
    });

    const storeData = async () => {
      const data = await fetchData();
      cache.store("key", data, {
        ttl: 3600000,
        tags: ["important"],
        autoRefresh: true,
        refreshFunction: fetchData,
      });
    };

    const getData = () => {
      return cache.get("key", {
        fallback: defaultData,
        validate: (data) => data && data.id,
      });
    };

    return {
      storeData,
      getData,
      cache,
    };
  },
};
```

### **⚡ Svelte Usage**

```javascript
import { useVormiaCacheSvelte } from "vormiaqueryjs/svelte";

export default {
  setup() {
    const cache = useVormiaCacheSvelte({
      defaultTTL: 1800000,
      defaultPriority: "high",
    });

    const storeData = async () => {
      const data = await fetchData();
      cache.store("key", data, {
        priority: "high",
        tags: ["critical"],
      });
    };

    const getData = () => {
      return cache.get("key", {
        fallback: defaultData,
      });
    };

    return {
      storeData,
      getData,
      cache,
    };
  },
};
```

### **🔧 Advanced Configuration Options**

```javascript
const cache = useVormiaCache({
  // Time settings
  defaultTTL: 1800000, // 30 minutes default TTL
  refreshInterval: 300000, // 5 minutes refresh interval

  // Priority settings
  defaultPriority: "high", // 'high', 'normal', 'low'

  // Auto-refresh settings
  autoRefresh: true, // Enable auto-refresh globally
  maxRetries: 3, // Maximum retry attempts
  retryDelay: 1000, // Base retry delay (exponential backoff)
});
```

### **📊 Cache Entry Options**

```javascript
cache.store("key", data, {
  // Time settings
  ttl: 3600000, // Custom TTL for this entry

  // Priority and organization
  priority: "high", // 'high', 'normal', 'low'
  tags: ["user", "profile"], // Tags for invalidation
  size: 1024, // Size in bytes for cleanup calculations

  // Auto-refresh settings
  autoRefresh: true, // Enable auto-refresh for this entry
  refreshInterval: 300000, // Custom refresh interval
  refreshFunction: fetchData, // Function to refresh data
  maxRetries: 2, // Custom retry count
  retryDelay: 1500, // Custom retry delay
});
```

### **🔄 Smart Data Retrieval**

```javascript
const data = cache.get("key", {
  // Fallback data
  fallback: defaultData,

  // Data validation
  validate: (data) => {
    return data && typeof data === "object" && data.id && data.name;
  },

  // Auto-refresh options
  refresh: true, // Trigger refresh if data exists
  refreshFunction: fetchData, // Function to refresh data
});
```

### **📈 Cache Management**

```javascript
// Remove specific entry
cache.remove("user:profile");

// Invalidate by pattern
cache.invalidate("user:", { clearTimers: true });

// Invalidate by tags
cache.invalidateByTags(["profile"], { clearTimers: true });

// Clear all cache
cache.clear();

// Get cache statistics
const stats = cache.stats();

// Configure cache settings
cache.configure({
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 7200000, // 2 hours
  maxItems: 1000, // Maximum items
});
```

### **🎯 Use Cases**

- **🔄 Real-time Data**: Auto-refresh user dashboards
- **📱 Offline Apps**: Cache critical data for offline access
- **⚡ Performance**: Reduce API calls with smart caching
- **🔄 Background Sync**: Keep data fresh in the background
- **📊 Analytics**: Cache expensive API responses
- **🎨 User Preferences**: Persist user settings and preferences
- **📝 Form Data**: Auto-save form data with validation

---

## 🛡️ Route Protection with VormiaRouteGuard

The new `VormiaRouteGuard` component provides declarative route protection using your existing authentication system. It's available for React, Vue.js, and Svelte:

### **React Usage**

```jsx
import { VormiaRouteGuard } from "vormiaqueryjs/react";

<VormiaRouteGuard roles={["admin"]} redirectTo="/login">
  <AdminDashboard />
</VormiaRouteGuard>;
```

### **Vue.js Usage**

```javascript
import { createVormiaRouteGuardVue } from 'vormiaqueryjs/vue';

// In your Vue component
const VormiaRouteGuard = createVormiaRouteGuardVue();

// Use in template
<VormiaRouteGuard :roles="['admin']" redirect-to="/login">
  <AdminDashboard />
</VormiaRouteGuard>
```

### **Svelte Usage**

```javascript
import { createVormiaRouteGuardSvelte } from "vormiaqueryjs/svelte";

// In your Svelte component
const VormiaRouteGuard = createVormiaRouteGuardSvelte();

// Use in template
<VormiaRouteGuard roles={["admin"]} redirectTo="/login">
  <AdminDashboard />
</VormiaRouteGuard>;
```

### **Basic Usage**

```jsx
import { VormiaRouteGuard } from 'vormiaqueryjs/react';

// Role-based protection
<VormiaRouteGuard roles={["admin"]} redirectTo="/login">
  <AdminDashboard />
</VormiaRouteGuard>

// Permission-based protection
<VormiaRouteGuard permissions={["manage_users", "delete_posts"]} fallback={<AccessDenied />}>
  <UserManagement />
</VormiaRouteGuard>

// Multiple roles (ANY role)
<VormiaRouteGuard roles={["admin", "moderator"]} requireAll={false}>
  <ModeratorPanel />
</VormiaRouteGuard>

// Custom validation
<VormiaRouteGuard
  validate={(user) => user?.isVerified && user?.subscription === 'premium'}
  fallback={<UpgradeRequired />}
>
  <PremiumFeatures />
</VormiaRouteGuard>
```

### **Advanced Features**

- **Flexible Protection**: Support for roles, permissions, and custom validation
- **Multiple Fallback Options**: Redirect, custom components, or callbacks
- **Performance Optimized**: Only re-renders when auth state changes
- **Framework Agnostic**: Works across all supported frameworks
- **TypeScript Support**: Full type safety for all props and callbacks
- **Higher-Order Component**: `withVormiaGuard` HOC for class components
- **Hook Support**: `useVormiaGuard` hook for custom logic

## 🚀 Explore Further Features

### **🔄 Form Data Transformation**

Automatically transform form data before sending to API:

```jsx
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  formdata: {
    // Rename fields
    rename: {
      confirmPassword: "password_confirmation",
      user_name: "name",
    },

    // Add fields
    add: {
      terms: true,
      source: "web",
    },

    // Remove fields
    remove: ["confirmPassword", "tempField"],
  },
});

// Just pass formData - transformation happens automatically!
mutation.mutate(formData);
```

### **🔔 Notification System**

VormiaQueryJS provides a comprehensive notification system with multiple display variants:

#### **Notification Types**

- **Toast**: Auto-dismissing popup notifications
- **Banner**: Full-width at top of page
- **In-App**: Inline above forms
- **Modal**: Overlay centered on screen

#### **Notification Variants**

- **Success**: Green styling with ✅ icon
- **Error**: Red styling with ❌ icon
- **Warning**: Yellow styling with ⚠️ icon
- **Info**: Blue styling with ℹ️ icon

#### **Usage Example**

```jsx
// Create notifications
const successNotification = {
  type: "success",
  title: "Success",
  message: "Operation completed successfully!",
  variant: "banner", // or 'inapp', 'modal', 'toast'
};

// Display with NotificationPanel
<NotificationPanel
  notification={successNotification}
  onClose={() => setNotification(null)}
/>;
```

### **🐛 Debug System**

#### **Automatic Visibility**

The debug panel automatically:

- Shows when `VITE_VORMIA_DEBUG=true`
- Hides when `VITE_VORMIA_DEBUG=false` (production mode)
- Provides detailed console logging for troubleshooting

**💡 Simple Rule**: One variable controls everything - `true` = development, `false` = production

#### **Usage**

```jsx
import { ErrorDebugPanel, createDebugInfo } from "vormiaqueryjs/react";

// Create debug info from API response
const debugInfo = createDebugInfo(response);

// Display debug panel
<ErrorDebugPanel
  debugInfo={debugInfo}
  showDebug={true}
  onClose={() => setDebugInfo(null)}
/>;
```

---

## 🌍 Framework Support

### **React Components**

- `VormiaProvider`
- `NotificationPanel`
- `ErrorDebugPanel`
- `VormiaRouteGuard` - Route protection component

### **Vue.js Support**

- `createVormiaRouteGuardVue()` - Factory function for Vue 3 route guard
- `useVrmAuthEnhancedVue()` - Enhanced authentication hook for Vue 3 Composition API

### **Svelte Support**

- `createVormiaRouteGuardSvelte()` - Factory function for Svelte route guard
- `useVrmAuthEnhancedSvelte()` - Enhanced authentication hook for Svelte

### **Framework-Agnostic HTML**

### **Framework-Agnostic HTML**

```jsx
// Get HTML strings for other frameworks
const notificationHtml = query.getNotificationHtml(
  "success",
  "Success",
  "Data loaded!"
);
const debugHtml = query.getDebugHtml(response, true);

// Use in any framework
// Vue: <div v-html="notificationHtml"></div>
// Svelte: {@html notificationHtml}
// Vanilla JS: document.getElementById('notifications').innerHTML = notificationHtml;
```

---

## 🔧 Troubleshooting

### **Debug Panel Not Showing**

1. Check environment variable: `VITE_VORMIA_DEBUG=true`
2. Verify console logs show: `🔍 VormiaQuery Debug: VITE_VORMIA_DEBUG = true`
3. Check browser console for JavaScript errors

### **Environment Variables Not Working**

1. Ensure `VITE_` prefix on all variables
2. Restart dev server after changing `.env` file
3. Check variable names match exactly (case-sensitive)

### **Notifications Not Styling Correctly**

1. Ensure CSS classes are available
2. Check if Tailwind JIT compilation is working
3. CSS fallback classes should provide guaranteed styling
4. Override with custom CSS if needed

---

## 📚 Examples

See the `examples/` directory for comprehensive usage examples:

- React SPA setup
- Form data transformation
- Notification system usage
- Debug panel integration
- Cross-framework examples

### **🆕 Zustand Integration Examples**

- **`zustand-integration-example.jsx`**: Complete demonstration of all new Zustand-powered features
- **`vue-zustand-integration-example.vue`**: Vue.js implementation with Composition API
- **`svelte-zustand-integration-example.svelte`**: Svelte implementation with reactive stores
- **Route Protection**: Examples of `VormiaRouteGuard` usage across all frameworks
- **State Management**: Auth, cache, storage, and settings stores
- **Offline Support**: Caching strategies and offline data management
- **Enhanced Auth**: Token management, permissions, and user preferences
- **Smart Caching**: Cache invalidation, tagging, and offline queue management
- **User Preferences**: Theme switching, notification settings, and app configuration
- **Form Persistence**: Automatic form data saving and restoration

## 🏗️ Zustand Stores

VormiaQueryJS now includes powerful Zustand stores for comprehensive state management:

### **🔐 Auth Store (`useAuthStore`)**

- **User Authentication**: Login state, user data, and session management
- **Token Management**: Automatic token refresh, expiry handling, and secure storage
- **Permission System**: Granular permission checking with `hasPermission()` and `hasAnyPermission()`
- **Role Management**: Role-based access control with `hasRole()` and `hasAllRoles()`
- **Cross-Tab Sync**: State automatically synchronizes across browser tabs
- **Offline Detection**: Automatic offline state detection and handling

### **💾 Cache Store (`useCacheStore`)**

- **Smart Caching**: Intelligent cache invalidation with tags and expiration
- **Offline Persistence**: Data persists across browser sessions and offline periods
- **Request Queuing**: Offline requests are queued and processed when connection returns
- **Performance Optimization**: Configurable cache size limits and cleanup strategies
- **Cache Statistics**: Monitor cache hit rates and performance metrics

### **💿 Storage Store (`useStorageStore`)**

- **User Preferences**: Persistent user settings and customization
- **Form Data Persistence**: Automatic form saving and restoration
- **Search History**: Persistent search queries and recent searches
- **Recent Items**: Track and restore recently accessed content
- **Generic Storage**: Flexible key-value storage for any application data
- **Import/Export**: Backup and restore user data

### **⚙️ Settings Store (`useSettingsStore`)**

- **Theme Management**: Dynamic theme switching with persistent preferences
- **UI Configuration**: Font sizes, compact mode, sidebar state
- **Notification Settings**: Customizable notification preferences
- **Performance Tuning**: Configurable performance and network settings
- **Privacy Controls**: User privacy and data handling preferences
- **Localization**: Language and regional settings

---

## 🧪 **Testing & Quality Assurance**

VormiaQueryJS includes comprehensive testing with modern tools:

- **🧪 Vitest Testing**: Fast, modern testing framework with React Testing Library
- **🔍 Component Testing**: Full component testing with mocked Zustand stores
- **📊 Store Testing**: Comprehensive testing of all Zustand stores
- **🔄 Integration Testing**: End-to-end testing of authentication and caching flows
- **📱 Cross-Framework Testing**: Tests ensure compatibility across all supported frameworks
- **🛡️ Error Handling Tests**: Comprehensive error scenario testing
- **📈 Performance Testing**: Cache performance and memory usage validation

### **Running Tests**

```bash
# Run all tests
npm test

# Run specific test files
npm test test/zustand-integration.test.js
npm test test/VormiaRouteGuard.test.jsx

# Run tests in watch mode
npm run test:watch
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
