# VormiaQueryJS

A powerful, framework-agnostic query and mutation library with built-in error handling, notifications, and debug capabilities.

## ✨ **Features Overview (v1.4.31)**

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

// ❌ Avoid: Manual HTML styling
{
  generalError && (
    <div className="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
      {/* ... manual styling ... */}
    </div>
  );
}
```

**Available Types**: `success`, `error`, `warning`, `info`, `announce`

**🎨 Notification Styling**: All notification types use solid background colors with perfect contrast:

| Type | Background | Text | Border | Description |
|------|------------|------|--------|-------------|
| **Success** | `bg-green-500` | `text-white` | `border-green-200` | Professional green with white text |
| **Error** | `bg-red-500` | `text-white` | `border-red-200` | Clear red with white text |
| **Warning** | `bg-yellow-500` | `text-white` | `border-yellow-200` | Bright yellow with white text |
| **Info** | `bg-blue-500` | `text-white` | `border-blue-200` | Trusted blue with white text |
| **Announce** | `bg-black` | `text-white` | `border-gray-200` | **Pure black with white text for maximum contrast** |

**CSS Fallback**: Guaranteed styling even when Tailwind JIT compilation fails.

**🛡️ Reliability Features:**
- **Dual-Class System**: Tailwind + CSS fallback classes
- **Guaranteed Styling**: CSS with `!important` ensures notifications always work
- **Perfect Contrast**: All combinations meet WCAG accessibility standards
- **Framework Agnostic**: Works consistently across all supported frameworks

## 📦 **Required Peer Dependencies**

Before installing `vormiaqueryjs`, you must install the correct peer dependencies for your framework:

- **React**: `@tanstack/react-query`
- **Vue**: `@tanstack/vue-query`
- **Svelte**: `@tanstack/svelte-query`
- **Solid**: `@tanstack/solid-query`
- **Qwik**: `@builder.io/qwik`
- **Astro**: `@tanstack/react-query` + `react react-dom`
- **Common**: `axios` (required for all frameworks)

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

## 📘 **TypeScript Support**

VormiaQueryJS includes **complete TypeScript definitions** for all functions, hooks, components, and types. No additional `@types` package is required!

### **Automatic Type Detection**

TypeScript will automatically detect the types when you import from `vormiaqueryjs`:

```typescript
import {
  useVormiaQuery,
  VormiaConfig,
  VormiaError,
  createVormiaClient,
  HttpMethod,
} from "vormiaqueryjs";

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

## 🌟 Core Features

### **🚀 What VormiaQueryJS Offers:**

- **🔒 Authentication System**: Built-in token management with automatic request handling
- **🔄 Form Data Transformation**: Automatically rename, add, and remove fields before sending to API
- **🔔 Smart Notifications**: Toast, banner, in-app, and modal notifications with success/error/warning/info types
- **🐛 Debug System**: Environment-aware debug panel with comprehensive logging
- **🌍 Cross-Framework**: Works with React, Vue, Svelte, Solid, Qwik, and Astro
- **⚡ Performance**: Built on TanStack Query for optimal caching and state management
- **🛡️ Error Handling**: Comprehensive error parsing and field-level error mapping
- **🧪 Tested**: Modern testing with Vitest for reliability

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
- `useVrmQuery` - Legacy query support
- `useVrmMutation` - Legacy mutation support

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
import { VormiaProvider } from "vormiaqueryjs";

function App() {
  return (
    <VormiaProvider
      config={{
        baseURL: import.meta.env.VITE_VORMIA_API_URL,
      }}
    >
      <YourApp />
    </VormiaProvider>
  );
}
```

### **NotificationPanel** - Advanced Notification System

```jsx
import { NotificationPanel } from "vormiaqueryjs";

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
import { SimpleNotification } from "vormiaqueryjs";

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
import { ErrorDebugPanel } from "vormiaqueryjs";

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
import { useVormiaQuery } from "vormiaqueryjs";

const query = useVormiaQuery({
  endpoint: "/public/data",
  method: "GET",
  showDebug: true, // Override debug panel visibility
});
```

### **2. useVormiaQueryAuth** - Authenticated Query

```jsx
import { useVormiaQueryAuth } from "vormiaqueryjs";

const query = useVormiaQueryAuth({
  endpoint: "/user/profile",
  method: "GET",
  showDebug: true, // Override debug panel visibility
});
```

### **3. useVormiaQueryAuthMutation** - Authenticated Mutation with Form Transformation

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

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
import { useVormiaQuerySimple } from "vormiaqueryjs";

const query = useVormiaQuerySimple({
  endpoint: "/test-endpoint",
  method: "POST",
  data: { test: "data" },
  showDebug: true, // Override debug panel visibility
});
```

### **5. Legacy Hooks (Backward Compatibility)**

```jsx
import { useVrmQuery, useVrmMutation } from "vormiaqueryjs";

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
import { useVormiaAuth } from "vormiaqueryjs";

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

---

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
import { ErrorDebugPanel, createDebugInfo } from "vormiaqueryjs";

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

1. Update to v1.4.4+ (styling issues fixed)
2. Ensure CSS classes are available
3. Override with custom CSS if needed

---

## 📚 Examples

See the `examples/` directory for comprehensive usage examples:

- React SPA setup
- Form data transformation
- Notification system usage
- Debug panel integration
- Cross-framework examples

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
