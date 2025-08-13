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
- 🔥 **Astro Support**: VormiaQueryJS now works in Astro via `src/adapters/astro/useVormia.js`.

- 🔥 **Auth Hook Renaming**: `useVrmAuth` → `useVormiaQueryAuth`, etc. Update your imports and usage accordingly.

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

## Error Handling

```js
try {
  await mutation.mutateAsync(data);
} catch (error) {
  if (error.isValidationError()) {
    // Handle validation errors
  } else if (error.isUnauthorized()) {
    // Handle auth errors
  } else if (error.isServerError()) {
    // Handle server errors
  }
}
```

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
