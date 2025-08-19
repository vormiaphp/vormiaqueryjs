# VormiaQueryJS

A universal query and mutation library for seamless data fetching and state management, designed for use with React, Vue, Svelte, Solid, Qwik, and Astro. Built for modern JavaScript projects and Laravel/VormiaPHP backends.

> **📦 Latest Version**: `v1.4.2` - Enhanced error handling, comprehensive notifications, and improved debug system

---

## 🚀 Installation (JavaScript/Frontend)

Install VormiaQueryJS using your favorite package manager:

> **📦 Latest Version**: `v1.4.2` - Enhanced error handling, comprehensive notifications, and improved debug system

### **npm**

```bash
npm install vormiaqueryjs
```

### **bun**

```bash
bun add vormiaqueryjs
```

### **pnpm**

```bash
pnpm add vormiaqueryjs
```

### **yarn**

```bash
yarn add vormiaqueryjs
```

> **🌐 Browser Compatibility**: VormiaQueryJS is designed for **browser environments** and uses ESM modules for optimal compatibility with modern bundlers like Vite, Webpack, and Rollup. It does not support Node.js environments.

---

## 📋 Changelog

### **v1.4.2** - Enhanced Error Handling & Debug System

- 🔧 **Fixed**: ErrorDebugPanel now properly displays API responses and debug information
- 🔧 **Fixed**: Console logging now works correctly with comprehensive debug detection
- 🔧 **Fixed**: NotificationPanel styling issues resolved for all notification types
- 📝 **Updated**: Environment variable documentation with correct naming conventions
- 🎯 **Improved**: Debug system now properly respects `VITE_VORMIA_DEBUG` environment variable
- ✅ **Verified**: All components build successfully and maintain backward compatibility

### **v1.4.1** - Comprehensive Notification System

- 🆕 **Added**: Banner, in-app, and modal notification variants
- 🆕 **Added**: Success, error, warning, and info notification types for all variants
- 🎨 **Enhanced**: Notification styling with proper variant and type combinations
- 🔧 **Fixed**: NotificationPanel component compatibility with existing code
- 📚 **Added**: Comprehensive examples for all notification types

### **v1.4.0** - Major Package Enhancement

- 🆕 **Added**: Automatic form data transformation system
- 🆕 **Added**: Dual notification system (toast + custom panels)
- 🆕 **Added**: Smart debug panel with environment awareness
- 🆕 **Added**: Multiple query types (basic, authenticated, simple)
- 🆕 **Added**: Cross-framework support (React components + HTML strings)
- 🔧 **Simplified**: VormiaProvider configuration (environment-based feature flags)
- 📚 **Added**: Comprehensive documentation and examples

---

## 🚨 Required Peer Dependencies

After installing `vormiaqueryjs`, you must also install the correct peer dependencies for your stack:

- React:
  - `npm install @tanstack/react-query`
  - `npm install @tanstack/eslint-plugin-query` (optional)
- Vue:
  - `npm install @tanstack/vue-query`
  - `npm install @tanstack/eslint-plugin-query` (optional)
- Svelte:
  - `npm install @tanstack/svelte-query`
  - `npm install @tanstack/eslint-plugin-query` (optional)
- Solid:
  - `npm install @tanstack/solid-query`
  - `npm install @tanstack/eslint-plugin-query` (optional)
- Qwik:
  - `npm install @builder.io/qwik`
  - `npm install @tanstack/eslint-plugin-query` (optional)
- Astro:
  - `npm install @tanstack/react-query`
  - `npm install @tanstack/eslint-plugin-query` (optional)
  - `npm install react react-dom` (if not present, for React-based hooks/components)
- Common dependency for all frameworks:
  - `npm install axios`

---

## 🌟 Enhanced Features

- 🚀 **Easy to use**: Simple API for GET, POST, PUT, DELETE operations
- 🔒 **Built-in Authentication**: Token-based auth with automatic handling
- ⚡ **Framework Agnostic**: Works with React, Vue, Svelte, Solid, Qwik, **Astro**
- 🛡️ **Enhanced Error Handling**: Comprehensive error handling with smart response parsing
- 🧪 **Tested with Vitest**: Modern, fast JavaScript testing
- 🟩 **Pure JavaScript**: No TypeScript required
- 🔥 **Astro Support**: VormiaQueryJS now works in Astro via `src/adapters/astro/useVormia.js`

### 🆕 **New Enhanced Features**

- **🔄 Automatic Form Data Transformation**: Automatically rename, add, and remove fields before sending to API
- **🔔 Dual Notification System**: Toast notifications + custom notification panels
- **🐛 Smart Debug Panel**: Environment-aware debug information display
- **🎯 Multiple Query Types**: Basic, authenticated, and simple test queries
- **🌍 Cross-Framework Support**: React components + HTML strings for any framework
- **⚙️ Smart Configuration**: Global defaults with per-query overrides

---

## 🚀 Quick Start with VormiaProvider

The easiest way to get started with VormiaQueryJS is using the `VormiaProvider` component. This automatically handles client initialization and configuration with all the new enhanced features:

```jsx
import React from "react";
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

### Configuration Options

The `VormiaProvider` accepts these essential configuration options:

- **`baseURL`** (required): Your API base URL
- **`timeout`** (optional): Request timeout in milliseconds (default: 30000)
- **`withCredentials`** (optional): Whether to include credentials (default: false)
- **`authTokenKey`** (optional): Key for storing auth token (default: "vormia_auth_token")

### Environment Variables

Configure features using environment variables in your `.env` file:

```bash
# API Configuration
VITE_VORMIA_API_URL=https://api.example.com

# Notification System (enabled by default)
VITE_VORMIA_NOTIFICATION_TOAST=true      # Enable toast notifications
VITE_VORMIA_NOTIFICATION_PANEL=true      # Enable notification panels
VITE_VORMIA_NOTIFICATION_DURATION=5000   # Toast duration in milliseconds

# Debug System (disabled by default)
VITE_VORMIA_DEBUG=false                  # Enable debug panel
VITE_VORMIA_ENV=local                   # Environment (local/production)

# Advanced Configuration (optional)
VITE_VORMIA_AUTH_TOKEN_KEY=vormia_auth_token  # Custom auth token storage key
VITE_VORMIA_TIMEOUT=30000                     # Request timeout in milliseconds
VITE_VORMIA_WITH_CREDENTIALS=false            # Include credentials in requests
```

**⚠️ Important**: All environment variables must start with `VITE_` prefix to be accessible in the browser.

**Note**: All feature flags are controlled by environment variables, not through the provider configuration. This keeps the setup simple and allows per-environment control.

---

## 🔧 Troubleshooting

### **Debug Panel Not Showing**

If your debug panel isn't displaying API responses:

1. **Check environment variable**:

   ```bash
   VITE_VORMIA_DEBUG=true
   ```

2. **Verify in console**: You should see logs like:

   ```
   🔍 VormiaQuery Debug: VITE_VORMIA_DEBUG = true
   🔍 VormiaQuery Debug: Debug enabled = true
   ```

3. **Check browser console** for any JavaScript errors

### **Environment Variables Not Working**

If environment variables aren't being detected:

1. **Ensure VITE\_ prefix**: All variables must start with `VITE_`
2. **Restart dev server** after changing `.env` file
3. **Check variable names** match exactly (case-sensitive)

> **🔧 Fixed in v1.4.2**: Environment variable documentation updated with correct naming conventions. All variables now properly documented with `VITE_` prefix.

### **Notifications Not Styling Correctly**

If notifications appear without proper colors:

1. **Update to v1.4.2+**: Styling issues fixed in latest version
2. **Check CSS classes**: Ensure Tailwind CSS is available if using default styles
3. **Custom styling**: Override with your own CSS classes

---

## 🔄 Form Data Transformation

### Automatic Transformation (Default)

VormiaQueryJS automatically transforms your form data before sending it to the API:

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // AUTOMATIC FORM DATA TRANSFORMATION
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
        source: "registration_form",
      },

      // Remove fields
      remove: ["confirmPassword", "tempField"],
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Just pass formData - package handles transformation automatically!
    mutation.mutate(formData);

    // The package automatically transforms:
    // { name, email, password, confirmPassword }
    // To: { name, email, password, password_confirmation, terms: true, source: "registration_form" }
    // And removes: confirmPassword, tempField
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="Full Name"
      />

      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
      />

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder="Password"
      />

      <input
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
        }
        placeholder="Confirm Password"
      />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
```

### Manual Transformation Override

If you prefer to handle transformation manually (your current way):

```jsx
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  manualTransformation: true, // Disable automatic transformation
});

const handleSubmit = (e) => {
  e.preventDefault();

  // Manual transformation (your current way)
  const registrationData = {
    ...formData,
    password_confirmation: formData.confirmPassword,
    confirmPassword: undefined,
    terms: true,
  };

  mutation.mutate(registrationData);
};
```

### Global vs Per-Query Configuration

```jsx
// Global configuration in VormiaProvider
<VormiaProvider config={{
  defaultFormdata: {
    rename: { confirmPassword: "password_confirmation" },
    add: { terms: true },
    remove: ["confirmPassword"]
  }
}}>

// Per-query override (completely replaces global)
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  formdata: {
    rename: { email: "email_address" },
    add: { source: "mobile" }
  }
});

// Per-query merge (combines with global)
const mutation2 = useVormiaQueryAuthMutation({
  endpoint: "/profile",
  formdata: {
    mergeWithGlobal: true,  // This merges with global mappings
    add: { updated: true }  // Additional fields
  }
});
```

---

## 🔔 Notification System

> **🔧 Fixed in v1.4.2**: Notification styling issues resolved. All notification types now display with proper colors and layout.

### Toast Notifications

```jsx
const query = useVormiaQuery({
  endpoint: "/users",
  enableNotifications: { toast: true, panel: false },
});

// Notifications are automatically shown on success/error
// Or manually trigger:
query.showSuccessNotification("Data loaded!", "Success");
query.showErrorNotification("Failed to load data", "Error");
```

### Custom Notification Panels

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

### Framework-Agnostic HTML

```jsx
// Get HTML strings for other frameworks
const notificationHtml = query.getNotificationHtml('success', 'Success', 'Data loaded!');

// Vue
<div v-html="notificationHtml"></div>

// Svelte
{@html notificationHtml}

// Vanilla JS
document.getElementById('notifications').innerHTML = notificationHtml;

// Angular
<div [innerHTML]="notificationHtml"></div>

// SolidJS
<div innerHTML={notificationHtml}></div>
```

---

## 🐛 Debug Panel System

> **🔧 Fixed in v1.4.2**: Debug panel now properly displays API responses and debug information. Console logging works correctly with comprehensive debug detection.

### Automatic Visibility

The debug panel automatically:

- Shows when `VITE_VORMIA_DEBUG=true`
- Hides when `VITE_VORMIA_DEBUG=false`
- Hides in production builds
- Respects environment variable settings
- Provides detailed console logging for troubleshooting

### React Component

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
```

### Framework-Agnostic HTML

```jsx
// Get debug panel HTML for other frameworks
const debugHtml = query.getDebugHtml(response, true);

// Use in any framework
document.getElementById("debug").innerHTML = debugHtml;
```

### Environment Configuration

```bash
# .env
VITE_VORMIA_DEBUG=true          # Show debug panel
VITE_VORMIA_DEBUG=false         # Hide debug panel
VITE_VORMIA_ENV=local          # Environment type
VITE_VORMIA_ENV=production     # Production environment
```

---

## 🎯 Query Types

### 1. Basic Query (No Auth)

```jsx
import { useVormiaQuery } from "vormiaqueryjs";

function PublicDataComponent() {
  const query = useVormiaQuery({
    endpoint: "/public/data",
    method: "GET",

    // Override global notification settings
    enableNotifications: { toast: true, panel: false },

    // Override global debug settings
    showDebug: true,

    // Cache configuration
    retry: 3,
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use enhanced utilities
  const handleSuccess = () => {
    // Show custom notification
    query.showSuccessNotification("Data loaded successfully!", "Success");

    // Get notification HTML for other frameworks
    const notificationHtml = query.getNotificationHtml(
      "success",
      "Success",
      "Data loaded!"
    );

    // Get debug panel HTML
    const debugHtml = query.getDebugHtml(query.data);

    // Log for debugging
    query.logForDebug(query.data, "Public Data Loaded");
  };

  return (
    <div>
      {query.isLoading && <p>Loading...</p>}
      {query.error && <p>Error: {query.error.message}</p>}
      {query.data && (
        <div>
          <h3>Public Data</h3>
          <pre>{JSON.stringify(query.data, null, 2)}</pre>
          <button onClick={handleSuccess}>Show Notifications</button>
        </div>
      )}
    </div>
  );
}
```

### 2. Authenticated Query

```jsx
import { useVormiaQueryAuth } from "vormiaqueryjs";

function UserProfileComponent() {
  const query = useVormiaQueryAuth({
    endpoint: "/user/profile",
    method: "GET",

    // Override global settings
    enableNotifications: { toast: false, panel: true },
    showDebug: false,
  });

  return (
    <div>
      {query.isLoading && <p>Loading profile...</p>}
      {query.error && <p>Error: {query.error.message}</p>}
      {query.data && (
        <div>
          <h3>User Profile</h3>
          <pre>{JSON.stringify(query.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### 3. Authenticated Mutation

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",

    // Automatic form data transformation
    formdata: {
      confirmPassword: "password_confirmation",
      add: { terms: true },
      remove: ["confirmPassword"],
    },

    // Override global settings
    enableNotifications: { toast: true, panel: true },
    showDebug: true,

    // Custom success/error handlers
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      // Navigate to login
      navigate("/login");
    },

    onError: (error) => {
      console.log("Registration failed:", error);
      // Handle field errors automatically
      const hasFieldErrors =
        error.response?.errors || error.response?.response?.data?.errors;
      if (hasFieldErrors) {
        // Package automatically handles field error mapping
        // based on the formdata configuration
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setGeneralError("");

    // Just pass formData - package handles transformation automatically!
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="Full Name"
      />
      {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}

      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
      />
      {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder="Password"
      />
      {fieldErrors.password && (
        <span className="error">{fieldErrors.password}</span>
      )}

      <input
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
        }
        placeholder="Confirm Password"
      />
      {fieldErrors.confirmPassword && (
        <span className="error">{fieldErrors.confirmPassword}</span>
      )}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating Account..." : "Create Account"}
      </button>

      {generalError && <p className="error">{generalError}</p>}
    </form>
  );
}
```

### 4. Simple Test Query

```jsx
import { useVormiaQuerySimple } from "vormiaqueryjs";

function TestComponent() {
  const testQuery = useVormiaQuerySimple({
    endpoint: "/test",
    method: "POST", // or GET, PATCH, PUT, DELETE

    // Override global settings
    enableNotifications: { toast: true, panel: false },
    showDebug: true,

    onSuccess: (data) => {
      console.log("Test successful:", data);
    },

    onError: (error) => {
      console.log("Test failed:", error);
    },
  });

  const handleTest = () => {
    // Execute with data
    testQuery.execute({ test: "data" });

    // Or execute asynchronously
    // testQuery.executeAsync({ test: "data" }).then(result => {
    //   console.log("Async result:", result);
    // });
  };

  return (
    <div>
      <button onClick={handleTest} disabled={testQuery.isPending}>
        {testQuery.isPending ? "Testing..." : "Run Test"}
      </button>

      {testQuery.data && (
        <div>
          <h3>Test Result</h3>
          <pre>{JSON.stringify(testQuery.data, null, 2)}</pre>
        </div>
      )}

      {testQuery.error && (
        <div>
          <h3>Test Error</h3>
          <pre>{JSON.stringify(testQuery.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Enhanced Utilities

### Form Data Transformation

```jsx
// Update formdata configuration
mutation.updateFormdata({
  add: { newField: "value" },
  remove: ["oldField"],
});

// Transform data manually
const transformedData = mutation.transformFormData(formData);
```

### Debug Logging

```jsx
// Log for debugging
query.logForDebug(query.data, "Custom Label");

// Get debug HTML
const debugHtml = query.getDebugHtml(response, true);
```

### Notification HTML

```jsx
// Get notification HTML
const notificationHtml = query.getNotificationHtml(
  "success",
  "Title",
  "Message"
);
```

---

## 🌐 Framework Support

### React

```jsx
import { NotificationPanel, ErrorDebugPanel } from "vormiaqueryjs";

<NotificationPanel notification={notification} />
<ErrorDebugPanel debugInfo={debugInfo} />
```

### Vue

```vue
<template>
  <div v-html="notificationHtml"></div>
  <div v-html="debugHtml"></div>
</template>

<script setup>
import { useVormiaQuery } from "vormiaqueryjs";

const { data, error, isLoading, refetch } = useVormiaQuery({
  endpoint: "/categories",
  method: "GET",
});

// Get HTML for Vue
const notificationHtml = ref(null);
const debugHtml = ref(null);

onMounted(() => {
  notificationHtml.value = data.value?.getNotificationHtml(
    "success",
    "Success",
    "Data loaded!"
  );
  debugHtml.value = data.value?.getDebugHtml(data.value, true);
});
</script>
```

### Svelte

```svelte
<script>
  import { useVormiaQuery } from 'vormiaqueryjs';

  const { data, error, isLoading, refetch } = useVormiaQuery({
    endpoint: '/categories',
    method: 'GET',
  });

  let notificationHtml = '';
  let debugHtml = '';

  $: if (data) {
    notificationHtml = data.getNotificationHtml('success', 'Success', 'Data loaded!');
    debugHtml = data.getDebugHtml(data, true);
  }
</script>

<div>{@html notificationHtml}</div>
<div>{@html debugHtml}</div>
```

### Vanilla JS

```javascript
import { useVormiaQuery } from "vormiaqueryjs";

const query = useVormiaQuery({
  endpoint: "/categories",
  method: "GET",
});

// Get HTML strings
const notificationHtml = query.getNotificationHtml(
  "success",
  "Success",
  "Data loaded!"
);
const debugHtml = query.getDebugHtml(query.data, true);

// Use in DOM
document.getElementById("notifications").innerHTML = notificationHtml;
document.getElementById("debug").innerHTML = debugHtml;
```

---

## 📱 Migration Guide

### From Old Version

```jsx
// Old way (still works)
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  onSuccess: (data) => {
    /* complex logic */
  },
  onError: (error) => {
    /* complex error handling */
  },
});

// Manual transformation
const registrationData = {
  ...formData,
  password_confirmation: formData.confirmPassword,
  confirmPassword: undefined,
  terms: true,
};
mutation.mutate(registrationData);
```

### To New Version

```jsx
// New way (automatic)
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  formdata: {
    confirmPassword: "password_confirmation",
    add: { terms: true },
    remove: ["confirmPassword"],
  },
  onSuccess: (data) => navigate("/login"), // Only custom logic
});

// Just pass formData
mutation.mutate(formData);
```

---

## 🚨 Error Handling

### Automatic Field Error Mapping

```jsx
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  formdata: {
    rename: {
      password_confirmation: "confirmPassword", // Map API field to form field
    },
  },
});

// Package automatically maps API errors to form fields
// API returns: { errors: { password_confirmation: ["Passwords don't match"] } }
// Package maps to: { confirmPassword: "Passwords don't match" }
```

### Custom Error Handlers

```jsx
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  onError: (error) => {
    // Package already handled error parsing and notifications
    // Add custom logic here
    console.log("Custom error handling:", error);
  },
});
```

---

## 🔍 Debug Information

### Debug Panel Content

The debug panel shows:

- HTTP status code
- Error type
- API message
- Response data/errors
- Debug information
- Timestamp

### Environment Detection

```bash
# Development
VITE_VORMIA_DEBUG=true  → Debug panel visible
VITE_VORMIA_ENV=local   → Local environment

# Production
VITE_VORMIA_DEBUG=false → Debug panel hidden
VITE_VORMIA_ENV=production → Production environment
```

---

## 📚 Examples

See `examples/enhanced-usage.js` for comprehensive examples of all features.

---

## 🛠️ Laravel Integration (Backend)

For Laravel backend integration with VormiaQueryJS, install the official Laravel package:

```bash
composer require vormiaphp/vormiaqueryphp
```

Follow the complete installation and usage instructions at:

- [GitHub Repository](https://github.com/vormiaphp/vormiaqueryphp)
- [Packagist Package](https://packagist.org/packages/vormiaphp/vormiaqueryphp)

The Laravel package provides middleware, helpers, and complete integration for API communication with VormiaQueryJS.

---

## Testing

This project uses [Vitest](https://vitest.dev/) for all tests. Example:

```bash
npm test
```

- All tests are written in JavaScript.
- No TypeScript or Jest is required.

---

## API Reference

- See the source code and examples above for API usage for each framework.
- All hooks and helpers are available under their respective framework adapter paths.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

This enhanced version maintains backward compatibility while adding powerful new features. All existing code will continue to work without changes.

## 📄 License

Same as the original VormiaQueryJS package.
