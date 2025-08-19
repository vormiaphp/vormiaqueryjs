# VormiaQuery

A universal query and mutation library for seamless data fetching and state management, designed for use with React, Vue, Svelte, Solid, Qwik, and Astro. Built for modern JavaScript projects and Laravel/VormiaPHP backends.

---

## 🚀 Installation (JavaScript/Frontend)

Install VormiaQueryJS using your favorite package manager:

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

### **yarn**

```bash
yarn add vormiaqueryjs
```

### **pnpm**

```bash
pnpm add vormiaqueryjs
```

### **deno** (experimental, not fully supported)

```ts
import vormiaqueryjs from "npm:vormiaqueryjs";
```

> ⚠️ VormiaQueryJS is not fully Deno-compatible due to Node.js built-ins. Use with caution.

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

> **Note:** VormiaQuery no longer prompts you to install peer dependencies after installation. Please refer to the instructions above and install the required dependencies for your framework manually. This change improves compatibility with bun, pnpm, and other package managers.

---

## 🌟 Features

- 🚀 **Easy to use**: Simple API for GET, POST, PUT, DELETE operations
- 🔒 **Built-in Authentication**: Token-based auth with automatic handling
- ⚡ **Framework Agnostic**: Works with React, Vue, Svelte, Solid, Qwik, **Astro**
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types
- 🧪 **Tested with Vitest**: Modern, fast JavaScript testing
- 🟩 **Pure JavaScript**: No TypeScript required
- 🔥 **Astro Support**: VormiaQueryJS now works in Astro via `src/adapters/astro/useVormia.js`
- 🔥 **Auth Hook Renaming**: `useVrmAuth` → `useVormiaQueryAuth`, etc. Update your imports and usage accordingly

### 🆕 **Debug & Notification System**

VormiaQueryJS now includes a comprehensive debugging and notification system:

- **🔍 ErrorDebugPanel**: Technical debug information for developers
- **🔔 NotificationPanel**: User-friendly success, error, warning, and info notifications
- **📝 FieldErrors**: Comprehensive field-level validation error handling
- **⚙️ EnhancedErrorHandler**: Unified error handling that integrates all components
- **🌍 Framework-Agnostic**: Works with any framework or vanilla JavaScript
- **🔧 Environment-Based**: Debug mode controlled by `VITE_VORMIA_DEBUG` environment variable

---

## 🚀 Quick Start with VormiaProvider

The easiest way to get started with VormiaQueryJS is using the `VormiaProvider` component. This automatically handles client initialization and configuration with built-in loading states and error handling:

```jsx
import React from "react";
import { VormiaProvider } from "vormiaqueryjs";

function App() {
  return (
    <VormiaProvider config={{ baseURL: "https://api.example.com" }}>
      <YourApp />
    </VormiaProvider>
  );
}
```

### Configuration Options

The `VormiaProvider` accepts these configuration options:

- **`baseURL`** (required): Your API base URL
- **`timeout`** (optional): Request timeout in milliseconds
- **`withCredentials`** (optional): Whether to include credentials
- **`authTokenKey`** (optional): Key for storing auth token

### Initialization Behavior

The `VormiaProvider` includes intelligent initialization handling:

- **Loading State**: Shows "Initializing VormiaQuery..." while setting up the client
- **Error Handling**: Displays clear error messages if initialization fails
- **Safety**: Children only render after successful client initialization
- **Direct Navigation**: Handles direct route access without "client not initialized" errors

### Alternative Setup Methods

If you prefer manual setup or need more control, you can also:

1. **Manual Initialization**: Use `createVormiaClient()` and `setGlobalVormiaClient()` directly
2. **Configuration Hook**: Use `useVormiaConfig()` hook for dynamic configuration
3. **Auto-Initialization**: Let hooks auto-initialize with default values

---

### Package Structure

VormiaQueryJS is organized for optimal browser compatibility:

```
vormiaqueryjs/
├── dist/esm/                    # ESM build (recommended for Vite/React)
│   ├── index.mjs               # Main exports
│   ├── adapters/               # Framework-specific adapters
│   │   ├── react/             # React-specific components
│   │   │   ├── VormiaProvider.mjs
│   │   │   └── useVormiaQuery.mjs
│   │   ├── vue/               # Vue adapters
│   │   ├── svelte/            # Svelte adapters
│   │   └── ...
│   ├── hooks/                  # React hooks
│   │   ├── useVormiaConfig.mjs
│   │   ├── useVrmAuth.mjs
│   │   └── ...
│   └── client/                 # Core client functionality
└── package.json                 # ESM-only configuration
```

**Note**: This package is designed for **browser environments** and uses ESM modules for optimal compatibility with modern bundlers like Vite.

## Usage Examples

## 🔧 How It Works

VormiaQueryJS provides a simple, provider-based approach to API management:

### 1. **Provider Setup** (Recommended)

```jsx
<VormiaProvider config={{ baseURL: "https://api.example.com" }}>
  <YourApp />
</VormiaProvider>
```

### 2. **Hook Usage**

Once the provider is set up, use hooks anywhere in your component tree:

```jsx
const { mutate: registerUser, isPending } = useVormiaQueryAuthMutation({
  endpoint: "/auth/register",
  onSuccess: (data) => console.log("Success:", data),
  onError: (error) => console.error("Error:", error),
});

// Use the mutation
registerUser({ name: "John", email: "john@example.com" });
```

### 3. **Automatic Client Management**

- **Global Client**: Automatically initialized and managed by VormiaProvider
- **Loading States**: Built-in loading indicators during initialization
- **Configuration**: Centralized in one place
- **Error Handling**: Built-in error handling and retry logic
- **Type Safety**: Full TypeScript support (when using TypeScript)

## 📦 Available Exports

### **Core Components**

- **`VormiaProvider`** - React provider for easy setup and configuration
- **`useVormiaConfig`** - Hook for dynamic configuration management

### **Query Hooks**

- **`useVrmQuery`** - General purpose query hook for data fetching
- **`useVormiaQueryAuth`** - Authentication query hook
- **`useVormiaQueryAuthMutation`** - Authentication mutation hook (login, register, etc.)
- **`useVrmMutation`** - General purpose mutation hook

### **Client Management**

- **`createVormiaClient`** - Create a new VormiaClient instance
- **`setGlobalVormiaClient`** - Set the global client instance
- **`getGlobalVormiaClient`** - Get the current global client instance

### **Utilities**

- **`HttpMethod`** - Enum of HTTP methods (GET, POST, PUT, DELETE, etc.)
- **`VormiaError`** - Error handling utilities

### React

```jsx
import React from "react";
import {
  VormiaProvider,
  useVormiaQuery,
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
} from "vormiaqueryjs";

function App() {
  return (
    <VormiaProvider config={{ baseURL: "https://api.example.com" }}>
      <CategoriesList />
    </VormiaProvider>
  );
}

function CategoriesList() {
  const { data, isLoading, error, refetch } = useVormiaQuery({
    endpoint: "/categories",
    method: "GET",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.response?.map((cat) => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
}
```

### Astro

> Astro uses React Query under the hood for VormiaQueryJS hooks.

```jsx
import { useVormiaQuery } from "vormiaqueryjs/adapters/astro";

export default function App() {
  const { data, isLoading, error } = useVormiaQuery({
    endpoint: "/categories",
    method: "GET",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.response?.map((cat) => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
}
```

### Vue

```js
<script setup>
import { useVormiaQuery } from 'vormiaqueryjs/adapters/vue';

const { data, error, isLoading, refetch } = useVormiaQuery({
  endpoint: '/categories',
  method: 'GET',
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="cat in data?.response" :key="cat.id">{{ cat.name }}</li>
  </ul>
</template>
```

### Svelte

```svelte
<script>
  import { createVormiaStore } from 'vormiaqueryjs/adapters/svelte';
  const store = createVormiaStore({ endpoint: '/categories', method: 'GET' });
</script>

{#if $store.loading}
  <p>Loading...</p>
{:else if $store.error}
  <p>Error: {$store.error.message}</p>
{:else}
  <ul>
    {#each $store.data?.response as cat}
      <li>{cat.name}</li>
    {/each}
  </ul>
{/if}
```

### Solid

```js
import { createVormiaResource } from "vormiaqueryjs/adapters/solid";

const [categories] = createVormiaResource({
  endpoint: "/categories",
  method: "GET",
});

function CategoriesList() {
  return (
    <ul>
      {categories()?.response?.map((cat) => (
        <li>{cat.name}</li>
      ))}
    </ul>
  );
}
```

### Qwik

```js
import { useVormiaQuery } from "vormiaqueryjs/adapters/qwik";

export default function CategoriesList() {
  const { data, isLoading, error } = useVormiaQuery({
    endpoint: "/categories",
    method: "GET",
  });
  // Render logic for Qwik
}
```

---

## 🆕 Debug & Notification System

VormiaQueryJS includes a comprehensive debugging and notification system that works with any framework or vanilla JavaScript.

### Quick Start

```javascript
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
} from "vormiaqueryjs";

// Initialize error handler
const errorHandler = createEnhancedErrorHandler({
  debugEnabled: true,
  showNotifications: true,
  showDebugPanel: true,
});

// Initialize field error manager
const fieldErrorManager = createFieldErrorManager();

// Handle API success
errorHandler.handleSuccess(response, {
  notificationMessage: "Operation completed successfully!",
});

// Handle API errors with field validation
errorHandler.handleError(error, {
  handleFieldErrors: true,
  fieldMapping: { password_confirmation: "confirmPassword" },
});

// Show notifications
showSuccessNotification("Welcome!", "Success", "#notifications", 3000);
```

### Framework Examples

#### React

```jsx
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
} from "vormiaqueryjs";

function MyComponent() {
  const [errorHandler] = useState(() => createEnhancedErrorHandler());
  const [fieldErrorManager] = useState(() => createFieldErrorManager());

  useEffect(() => {
    fieldErrorManager.addListener((errors) => {
      setFieldErrors(errors);
    });
  }, []);

  // Use in your component...
}
```

#### Vue

```vue
<script setup>
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
} from "vormiaqueryjs";

const errorHandler = createEnhancedErrorHandler();
const fieldErrorManager = createFieldErrorManager();

onMounted(() => {
  fieldErrorManager.addListener((errors) => {
    fieldErrors.value = errors;
  });
});
</script>
```

#### Svelte

```svelte
<script>
import { createEnhancedErrorHandler, createFieldErrorManager } from 'vormiaqueryjs';

let errorHandler = createEnhancedErrorHandler();
let fieldErrorManager = createFieldErrorManager();

onMount(() => {
  fieldErrorManager.addListener((errors) => {
    fieldErrors = errors;
  });
});
</script>
```

#### Solid

```jsx
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
} from "vormiaqueryjs";

function MyComponent() {
  const [errorHandler, setErrorHandler] = createSignal(null);
  const [fieldErrorManager, setFieldErrorManager] = createSignal(null);

  onMount(() => {
    setErrorHandler(createEnhancedErrorHandler());
    setFieldErrorManager(createFieldErrorManager());
  });
}
```

#### Qwik

```jsx
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
} from "vormiaqueryjs";

export default component$(() => {
  const errorHandler = useSignal(null);
  const fieldErrorManager = useSignal(null);

  useVisibleTask$(() => {
    errorHandler.value = createEnhancedErrorHandler();
    fieldErrorManager.value = createFieldErrorManager();
  });
});
```

#### Astro

```astro
---
// Astro component script
---

<script>
import { createEnhancedErrorHandler, createFieldErrorManager } from 'vormiaqueryjs';

document.addEventListener('DOMContentLoaded', () => {
  const errorHandler = createEnhancedErrorHandler();
  const fieldErrorManager = createFieldErrorManager();

  // Use in your component...
});
</script>
```

### Environment Configuration

Set `VITE_VORMIA_DEBUG=true` in your environment to enable debug mode:

```bash
# .env
VITE_VORMIA_DEBUG=true
```

### Key Components

- **ErrorDebugPanel**: Shows technical debug information for developers
- **NotificationPanel**: Displays user-friendly notifications
- **FieldErrorManager**: Handles field-level validation errors
- **EnhancedErrorHandler**: Orchestrates all error handling components

For detailed API documentation and advanced usage examples, see the examples in the `examples/` directory.

### Advanced Implementation Examples

#### Comprehensive Error Handling with Debug & Notifications

Here's an advanced example showing how to integrate the Debug & Notification System with VormiaQueryJS mutations:

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
  showErrorNotification,
} from "vormiaqueryjs";

function RegistrationForm() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize error handler and field error manager
  const errorHandler = createEnhancedErrorHandler({
    debugEnabled: true,
    showNotifications: true,
    showDebugPanel: true,
    notificationTarget: "#notifications",
    debugTarget: "#debug-panel",
  });

  const fieldErrorManager = createFieldErrorManager();

  const registerMutation = useVormiaQueryAuthMutation({
    endpoint: "/register",

    onSuccess: (data) => {
      // Log success for debugging
      errorHandler.logSuccessForDebug(data, "Registration Success");

      // Show success notification
      showSuccessNotification(
        data?.data?.message ||
          "Account created successfully. Please check your email to verify your account.",
        "Account Created! 🎉",
        "#notifications",
        3000
      );

      // Clear all errors and notification info
      setFieldErrors({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setGeneralError("");

      // Set debug info for debug panel
      const debugInfo = {
        status: 200,
        message: "Registration successful",
        response: {
          response: {
            data: {
              success: true,
              message: data?.data?.message || "Account created successfully",
              data: data?.data,
              debug: data?.debug,
            },
          },
          debug: data?.debug,
        },
        errorType: "success",
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(debugInfo);

      // Show debug panel if enabled (controlled by environment variable)
      const isDebugEnabled = import.meta.env.VITE_VORMIA_DEBUG === "true";
      console.log("Success - Debug enabled:", isDebugEnabled);
      console.log("Success - Setting showDebug to:", isDebugEnabled);
      setShowDebug(isDebugEnabled);

      // Force show debug panel if we have debug info and debug is enabled
      if (isDebugEnabled) {
        setShowDebug(true);
      }

      // Navigate to login after a short delay to show success message
      setTimeout(() => {
        // navigate('/login');
      }, 2000);
    },

    onError: (error) => {
      // Get clean error info using enhanced error handler
      const errorInfo = errorHandler.handleError(error, {
        handleFieldErrors: true,
        fieldMapping: {
          password_confirmation: "confirmPassword",
        },
      });

      setDebugInfo(errorInfo);

      // Show debug panel if enabled (controlled by environment variable)
      const isDebugEnabled = import.meta.env.VITE_VORMIA_DEBUG === "true";
      console.log("Debug enabled (error):", isDebugEnabled);
      console.log("Setting showNotification to (error):", isDebugEnabled);
      setShowDebug(isDebugEnabled);

      // Force show debug panel if we have debug info and debug is enabled
      if (isDebugEnabled) {
        setShowDebug(true);
      }

      // Log for debugging
      errorHandler.logErrorForDebug(error, "Registration Error");

      // Handle based on whether there are field-specific errors
      const hasFieldErrors =
        error.response?.errors || error.response?.response?.data?.errors;
      if (hasFieldErrors) {
        // Field errors are automatically handled by the enhanced error handler
        // You can also manually access them through fieldErrorManager
        const currentFieldErrors = fieldErrorManager.getAllFieldErrors();
        setFieldErrors(currentFieldErrors);
        setGeneralError("");
      } else {
        // General error handling
        setGeneralError(errorInfo.message);
        setFieldErrors({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }

      // Create error notification
      showErrorNotification(
        error.response?.message ||
          error.response?.response?.data?.message ||
          "An error occurred during registration.",
        "Registration Failed",
        "#notifications",
        0 // No auto-hide for errors
      );
    },
  });

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Clear previous errors
    fieldErrorManager.clearAllFieldErrors();
    setGeneralError("");

    // Submit form
    registerMutation.mutate(formData);
  };

  return (
    <div>
      {/* Your form JSX */}
      <form onSubmit={handleSubmit}>{/* Form fields */}</form>

      {/* Debug Panel */}
      {showDebug && debugInfo && (
        <div id="debug-panel">{/* Debug panel content */}</div>
      )}

      {/* Notifications Container */}
      <div id="notifications"></div>
    </div>
  );
}
```

#### Alternative: Using Enhanced Error Handler Directly

You can also use the enhanced error handler more directly for cleaner code:

```jsx
import { createEnhancedErrorHandler } from "vormiaqueryjs";

function RegistrationForm() {
  const errorHandler = createEnhancedErrorHandler({
    debugEnabled: true,
    showNotifications: true,
    showDebugPanel: true,
    notificationTarget: "#notifications",
    debugTarget: "#debug-panel",
  });

  const registerMutation = useVormiaQueryAuthMutation({
    endpoint: "/register",

    onSuccess: (data) => {
      // Handle success with enhanced error handler
      errorHandler.handleSuccess(data, {
        notificationMessage:
          "Account created successfully! Please check your email.",
        debugLabel: "Registration Success",
      });

      // Additional success logic...
    },

    onError: (error) => {
      // Handle error with enhanced error handler
      errorHandler.handleError(error, {
        handleFieldErrors: true,
        fieldMapping: { password_confirmation: "confirmPassword" },
        customErrorHandler: (error, errorInfo) => {
          // Custom error handling logic
          console.log("Custom error handling:", errorInfo);
        },
      });
    },
  });
}
```

#### Environment Configuration

Set up your environment variables for debug mode:

```bash
# .env
VITE_VORMIA_DEBUG=true
VITE_VORMIA_NOTIFICATION_TARGET=#notifications
VITE_VORMIA_DEBUG_TARGET=#debug-panel
```

#### Key Benefits of This Approach

1. **Centralized Error Handling**: All error logic is managed in one place
2. **Automatic Debug Panel**: Debug information is automatically displayed when enabled
3. **Field Error Mapping**: Automatically maps API field names to form field names
4. **Environment-Based Control**: Debug features can be enabled/disabled per environment
5. **Framework Agnostic**: Works with React, Vue, Svelte, Solid, Qwik, and Astro
6. **Consistent Notifications**: Standardized notification system across your app
7. **Developer Experience**: Rich debugging information during development

---

### Next Steps

1. **Configure your API base URL in your frontend environment.**
2. **Set up proper HTTPS/SSL on your backend for secure communication.**
3. **Use environment variables for configuration.**
4. **Add `.env` to your `.gitignore` for sensitive configuration.**

### Usage

- VormiaQuery provides secure API communication through HTTPS/SSL.
- Your Laravel backend should implement proper server-side security measures.
- See the VormiaQuery and Laravel documentation for integration details.

> **Note:** For production applications, always use HTTPS/SSL and implement proper server-side security measures.

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

## Quick Start

### Environment Variables

VormiaQuery supports configuration through environment variables. Create a `.env` file in your project root:

```env
VORMIA_API_URL=https://your-api.com/api/v1
VORMIA_AUTH_TOKEN_KEY=auth_token
VORMIA_TIMEOUT=30000
VORMIA_WITH_CREDENTIALS=false
```

---

## Authentication Example (React)

```jsx
import { useVormiaQueryAuth } from "vormiaqueryjs";

function LoginForm() {
  const { login, isLoading, error, isAuthenticated } = useVormiaQueryAuth({
    endpoint: "/auth/login",
    storeToken: true,
    onLoginSuccess: (data) => {
      console.log("Login successful:", data.user);
    },
  });

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (isAuthenticated) return <div>Welcome back!</div>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin({ email: "user@example.com", password: "password" });
      }}
    >
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

## Mutations Example (React)

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

function AddCategory() {
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/categories",
    method: "POST",
  });

  const handleAdd = async () => {
    await mutation.mutate({ name: "New Category" });
  };

  return <button onClick={handleAdd}>Add Category</button>;
}
```

---

## Clean Error Handling

VormiaQueryJS provides powerful error handling utilities that work with any API response format. The error handling focuses on the standard structure:

```json
{
  "success": true,
  "message": "Action was a success",
  "data": {
    /* optional data */
  },
  "debug": {
    /* any debug information */
  }
}
```

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    /* optional data */
  },
  "debug": {
    /* any debug information */
  }
}
```

### 1. Chainable Error Handler (`createErrorHandler`)

Perfect for complex error handling logic:

```javascript
import { createErrorHandler } from "vormiaqueryjs";

const handleError = (error) => {
  createErrorHandler(error)
    .ifValidationError((handler) => {
      const validationErrors = handler.getValidationErrors();
      const apiMessage = handler.getApiMessage();
      console.log("Validation failed:", apiMessage);
      console.log("Field errors:", validationErrors);
    })
    .ifServerError((handler) => {
      const apiDebug = handler.getApiDebug();
      console.log("Server error debug:", apiDebug);
    })
    .logDebug("Registration Error");
};
```

**Key Methods:**

- `getApiResponse()` - Gets the full API response data
- `getApiMessage()` - Gets the API message (falls back to error.message)
- `getApiData()` - Gets the API data field
- `getApiDebug()` - Gets the API debug object
- `getApiSuccess()` - Gets the API success boolean
- `logDebug(label)` - Logs comprehensive error information

### 2. Object-Based Handler (`handleError`)

Simple, direct access to all error information:

```javascript
import { handleError } from "vormiaqueryjs";

const handleError = (error) => {
  const errorInfo = handleError(error);

  console.log("Status:", errorInfo.status);
  console.log("API Message:", errorInfo.apiMessage);
  console.log("API Debug:", errorInfo.apiDebug);
  console.log("Is Validation Error:", errorInfo.isValidationError);

  // Log debug information
  errorInfo.logDebug("Registration Error");
};
```

**Available Properties:**

- `status`, `code`, `message` - Basic error info
- `apiResponse`, `apiMessage`, `apiData`, `apiDebug`, `apiSuccess` - API response data
- `isValidationError`, `isServerError`, `isNetworkError` - Error type checks
- `validationErrors` - Field validation errors
- `userMessage`, `errorMessage` - User-friendly messages

### 3. Toast Error Handler (`createToastErrorHandler`)

Automatically displays appropriate toast messages:

```javascript
import { createToastErrorHandler } from "vormiaqueryjs";

const handleError = createToastErrorHandler(toast, {
  showValidationErrors: true,
  showServerErrors: true,
  defaultMessages: {
    validationTitle: "Form Errors",
    serverMessage: "Something went wrong on our end",
  },
});

// Usage in mutation
useVormiaQueryAuthMutation({
  onError: handleError,
});
```

### 4. Form Error Handler (`createFormErrorHandler`)

Handles form-specific error scenarios:

```javascript
import { createFormErrorHandler } from "vormiaqueryjs";

const handleFormError = createFormErrorHandler({
  setFieldErrors,
  setGeneralError,
  fieldMapping: {
    password_confirmation: "confirmPassword",
  },
  toast,
  showToasts: true,
});

// Usage in mutation
useVormiaQueryAuthMutation({
  onError: handleFormError,
});
```

### Error Handling Examples

#### Basic Usage

```javascript
const handleError = (error) => {
  const apiResponse = error.response?.data || error.data;
  const apiMessage = apiResponse?.message || error.message;
  const apiDebug = apiResponse?.debug;

  console.log("API Message:", apiMessage);
  console.log("API Debug:", apiDebug);

  if (error.isValidationError()) {
    // Handle validation errors
    const validationErrors = error.getValidationErrors();
    setFieldErrors(validationErrors);
  } else if (error.isServerError()) {
    // Handle server errors
    setGeneralError(apiMessage);
  }
};
```

#### Advanced Usage with Chainable Handler

```javascript
const handleError = (error) => {
  createErrorHandler(error)
    .ifValidationError((handler) => {
      const validationErrors = handler.getValidationErrors();
      const apiMessage = handler.getApiMessage();

      // Map validation errors to form fields
      const fieldErrors = {};
      Object.keys(validationErrors).forEach((field) => {
        if (field === "password_confirmation") {
          fieldErrors.confirmPassword = validationErrors[field];
        } else {
          fieldErrors[field] = validationErrors[field];
        }
      });

      setFieldErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: apiMessage,
        variant: "destructive",
      });
    })
    .ifServerError((handler) => {
      const apiDebug = handler.getApiDebug();
      console.log("Server error details:", apiDebug);

      setGeneralError(handler.getApiMessage());
      toast({
        title: "Server Error",
        description: handler.getApiMessage(),
        variant: "destructive",
      });
    })
    .logDebug("Registration Error");
};
```

### Debug Information Access

The error handling utilities provide easy access to any debug information your API returns:

```javascript
const handleError = (error) => {
  const apiDebug = error.response?.data?.debug || error.data?.debug;

  if (apiDebug) {
    console.group("🐛 API Debug Information");
    console.log("Full Debug Object:", apiDebug);

    // Access any debug properties your API provides
    if (apiDebug.execution_time !== undefined) {
      console.log("Execution Time:", apiDebug.execution_time);
    }
    if (apiDebug.memory_usage !== undefined) {
      console.log("Memory Usage:", apiDebug.memory_usage);
    }
    if (apiDebug.trace) {
      console.log("Stack Trace:", apiDebug.trace);
    }
    if (apiDebug.custom_field) {
      console.log("Custom Debug:", apiDebug.custom_field);
    }
    console.groupEnd();
  }
};
```

This approach works with **any** debug object structure your API returns, making it flexible for different backend implementations.

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

## Extra Usage Examples

### 1. Basic Mutation (React)

```jsx
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

function SendMessage() {
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/messages",
    method: "POST",
  });

  const handleSend = async () => {
    await mutation.mutate({ message: "Hello World" });
  };

  return <button onClick={handleSend}>Send Message</button>;
}
```

### 2. Basic API Call (Node.js/SSR)

```js
import { VormiaClient } from "vormiaqueryjs";

const client = new VormiaClient({
  baseURL: "https://api.example.com",
});

async function getData() {
  const response = await client.get("/data");
  console.log(response.data);
}
```

### 3. Using VormiaQuery with Custom Headers

```js
import { useVormiaQuery } from "vormiaqueryjs";

const { data } = useVormiaQuery({
  endpoint: "/profile",
  method: "GET",
  headers: {
    "X-Requested-With": "VormiaQuery",
    "X-Custom-Token": "abc123",
  },
});
```

### 4. Error Handling for Validation Errors

```js
import { useVormiaQueryAuthMutation } from "vormiaqueryjs";

function RegisterForm() {
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",
  });

  const handleRegister = async (formData) => {
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      if (error.isValidationError()) {
        // Show validation errors to the user
        const errors = error.getValidationErrors();
        alert(JSON.stringify(errors));
      }
    }
  };

  // ...form rendering
}
```

### 5. VormiaQuery in a Next.js API Route (Node.js)

```js
// pages/api/proxy.js
import { VormiaClient } from "vormiaqueryjs";

const client = new VormiaClient({
  baseURL: "https://api.example.com",
});

export default async function handler(req, res) {
  const apiRes = await client.get("/data");
  res.status(200).json(apiRes.data);
}
```
