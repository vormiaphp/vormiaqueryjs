# VormiaQueryJS

A universal query and mutation library for seamless data fetching and state management, designed for use with React, Vue, Svelte, Solid, Qwik, and Astro. Built for modern JavaScript projects and Laravel/VormiaPHP backends.

> **📦 Latest Version**: `v1.4.4` - Cleaned up unused environment variables and improved documentation accuracy

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

## 🚨 Required Peer Dependencies

After installing `vormiaqueryjs`, you must also install the correct peer dependencies for your stack:

- **React**: `@tanstack/react-query`
- **Vue**: `@tanstack/vue-query`
- **Svelte**: `@tanstack/svelte-query`
- **Solid**: `@tanstack/solid-query`
- **Qwik**: `@builder.io/qwik`
- **Astro**: `@tanstack/react-query` + `react react-dom`
- **Common**: `axios` (required for all frameworks)

---

## 🌟 Core Features

- 🚀 **Easy to use**: Simple API for GET, POST, PUT, DELETE operations
- 🔒 **Built-in Authentication**: Token-based auth with automatic handling
- ⚡ **Framework Agnostic**: Works with React, Vue, Svelte, Solid, Qwik, and Astro
- 🛡️ **Enhanced Error Handling**: Comprehensive error handling with smart response parsing
- 🧪 **Tested with Vitest**: Modern, fast JavaScript testing
- 🟩 **Pure JavaScript**: No TypeScript required

---

## 🎯 Available Hooks

### **1. useVormiaQuery** - Basic Query (No Auth)

```jsx
import { useVormiaQuery } from "vormiaqueryjs";

const query = useVormiaQuery({
  endpoint: "/public/data",
  method: "GET",
  enableNotifications: { toast: true, panel: false },
  showDebug: true,
});
```

### **2. useVormiaQueryAuth** - Authenticated Query

```jsx
import { useVormiaQueryAuth } from "vormiaqueryjs";

const query = useVormiaQueryAuth({
  endpoint: "/user/profile",
  method: "GET",
  enableNotifications: { toast: false, panel: true },
  showDebug: false,
});
```

### **3. useVormiaQueryAuthMutation** - Authenticated Mutation

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  method: "POST",
  formdata: {
    rename: { confirmPassword: "password_confirmation" },
    add: { terms: true },
    remove: ["confirmPassword"],
  },
  enableNotifications: { toast: true, panel: true },
  showDebug: true,
});
```

### **4. useVormiaQuerySimple** - Flexible Test Query

```jsx
import { useVormiaQuerySimple } from "vormiaqueryjs";

const testQuery = useVormiaQuerySimple({
  endpoint: "/test",
  method: "POST",
  enableNotifications: { toast: true, panel: false },
  showDebug: true,
});
```

---

## 🏗️ Core Components

### **VormiaProvider** - Configuration Provider

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

### **NotificationPanel** - Notification Display

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

### **SimpleNotification** - Unified Drop-in Component

```jsx
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
```

**💡 Pro Tip**: Instead of writing manual HTML with Tailwind classes, use these pre-styled components!

#### **Available Notification Types:**
- **`type="success"`** - Green styling with ✅ icon
- **`type="error"`** - Red styling with ❌ icon  
- **`type="warning"** - Yellow styling with ⚠️ icon
- **`type="info"** - Blue styling with ℹ️ icon
- **`type="announce"`** - Black/white styling with 🔔 icon

#### **Before (Manual HTML - Don't do this!):**

```jsx
{
  /* ❌ Manual HTML with Tailwind - hard to maintain */
}
{
  generalError && (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{generalError}</p>
        </div>
      </div>
    </div>
  );
}
```

#### **After (Easy Component - Do this!):**

```jsx
{/* ✅ Simple component - easy to use and maintain */}
<SimpleNotification 
  type="error" 
  message={generalError} 
  onClose={() => setGeneralError(null)} 
/>
```

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
```

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

**🔔 Notification System**: Notifications are controlled per-query via the `enableNotifications` option, not through environment variables. This gives you full control over each request.

---

## 🔔 Notification System

VormiaQueryJS provides a comprehensive notification system with multiple display variants:

### **Notification Types**

- **Toast**: Auto-dismissing popup notifications
- **Banner**: Full-width at top of page
- **In-App**: Inline above forms
- **Modal**: Overlay centered on screen

### **Notification Variants**

- **Success**: Green styling with ✅ icon
- **Error**: Red styling with ❌ icon
- **Warning**: Yellow styling with ⚠️ icon
- **Info**: Blue styling with ℹ️ icon

### **Usage Example**

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

---

## 🐛 Debug System

### **Automatic Visibility**

The debug panel automatically:

- Shows when `VITE_VORMIA_DEBUG=true` (development mode)
- Hides when `VITE_VORMIA_DEBUG=false` (production mode)
- Provides detailed console logging for troubleshooting

**💡 Simple Rule**: One variable controls everything - `true` = development, `false` = production

### **Usage**

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

## 🔄 Form Data Transformation

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

1. Update to v1.4.2+ (styling issues fixed)
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
