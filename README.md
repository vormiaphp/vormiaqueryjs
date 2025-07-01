# VormiaQuery

> **🚨 Required Peer Dependencies**
>
> After installing `vormiaquery`, you must also install the correct peer dependencies for your stack:
>
> - React: `npm install @tanstack/react-query axios @tanstack/eslint-plugin-query`
> - Vue: `npm install @tanstack/vue-query axios @tanstack/eslint-plugin-query`
> - Svelte: `npm install @tanstack/svelte-query axios @tanstack/eslint-plugin-query`
> - Solid: `npm install @tanstack/solid-query axios @tanstack/eslint-plugin-query`
> - Qwik: `npm install @builder.io/qwik axios @tanstack/eslint-plugin-query`
>
> **You will be prompted after install, or see the instructions above.**

---

## 🔐 Encryption & Key Management

VormiaQuery supports optional end-to-end encryption using RSA public/private key pairs.

### Key Generation

Generate a secure RSA key pair using the built-in CLI tool:

```bash
npx vormiaquery-gen-keys
```

This will create two files in your project directory:

- `vormia_public.pem` (public key)
- `vormia_private.pem` (private key)

### Key Storage Recommendations

- **Backend (Laravel):**
  - Store the **public key** and **private key** in your `.env` or a secure config file.
  - Example:
    ```env
    VORMIA_PUBLIC_KEY="<contents of vormia_public.pem>"
    VORMIA_PRIVATE_KEY="<contents of vormia_private.pem>"
    ```
- **Frontend (SSR/Node.js):**
  - Store the **private key** and **public key** in your `.env` or config.
  - Example:
    ```env
    VORMIA_PRIVATE_KEY="<contents of vormia_private.pem>"
    VORMIA_PUBLIC_KEY="<contents of vormia_public.pem>"
    ```
- **Never expose your private key in client-side browser code!**

### Usage

- VormiaQuery can use these keys to encrypt requests and decrypt responses.
- Your Laravel backend should use the same keys to decrypt/encrypt data.
- See the VormiaQuery and Laravel documentation for integration details.

---

## Laravel Integration Example

To use RSA encryption/decryption in your Laravel backend, use [phpseclib](https://github.com/phpseclib/phpseclib):

### 1. Install phpseclib

```bash
composer require phpseclib/phpseclib
```

### 2. Example Controller Usage

```php
use phpseclib3\Crypt\RSA;

public function handleRequest(Request $request)
{
    $privateKey = env('VORMIA_PRIVATE_KEY');
    $publicKey = env('VORMIA_PUBLIC_KEY');

    // Decrypt incoming data
    if ($request->has('encrypted')) {
        $rsa = RSA::loadPrivateKey($privateKey);
        $decrypted = $rsa->decrypt(base64_decode($request->input('encrypted')));
        $data = json_decode($decrypted, true);
        // ... process $data ...
    }

    // Prepare response
    $response = ['foo' => 'bar'];
    if ($request->expectsEncryptedResponse) {
        $rsa = RSA::loadPublicKey($publicKey);
        $encrypted = base64_encode($rsa->encrypt(json_encode($response)));
        return response()->json(['encrypted' => $encrypted]);
    }

    return response()->json($response);
}
```

- Store your keys in `.env` as described above.
- Never expose your private key in frontend/browser code.

---

A universal query and mutation library for seamless data fetching and state management, designed for use with React, Vue, Svelte, Solid, and Qwik. Built for modern JavaScript projects and Laravel/VormiaPHP backends.

## Features

- 🚀 **Easy to use**: Simple API for GET, POST, PUT, DELETE operations
- 🔒 **Built-in Authentication**: Token-based auth with automatic handling
- 🔐 **Data Encryption**: Optional AES encryption for sensitive data
- ⚡ **Framework Agnostic**: Works with React, Vue, Svelte, Solid, Qwik
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types
- 🧪 **Tested with Vitest**: Modern, fast JavaScript testing
- 🟩 **Pure JavaScript**: No TypeScript required

## Installation

```bash
npm install vormiaquery
```

### Peer Dependencies

Install the peer dependencies for your framework:

**React:**

```bash
npm install react react-dom @tanstack/react-query
```

**Vue:**

```bash
npm install vue @tanstack/vue-query
```

**Svelte:**

```bash
npm install svelte @tanstack/svelte-query
```

**Solid:**

```bash
npm install solid-js @tanstack/solid-query
```

**Qwik:**

```bash
npm install @builder.io/qwik
```

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

## Usage Examples

### React

```jsx
import React from "react";
import { VormiaQueryProvider, useVrmQuery, useVrmMutation } from "vormiaquery";

function App() {
  return (
    <VormiaQueryProvider config={{ baseURL: "https://api.example.com" }}>
      <CategoriesList />
    </VormiaQueryProvider>
  );
}

function CategoriesList() {
  const { data, isLoading, error, refetch } = useVrmQuery({
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
import { useVormiaQuery } from 'vormiaquery/adapters/vue';

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
  import { createVormiaStore } from 'vormiaquery/adapters/svelte';
  const store = createVormiaStore({ endpoint: '/categories', method: 'GET' });
</script>

{#if $store.loading}
  <p>Loading...</p>
{:else if $store.error}
  <p>Error: {$store.error.message}</p>
{:else}
  <ul>
    {#each $store as cat}
      <li>{cat.name}</li>
    {/each}
  </ul>
{/if}
```

### Solid

```js
import { createVormiaResource } from "vormiaquery/adapters/solid";

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
import { useVormiaQuery } from "vormiaquery/adapters/qwik";

export default function CategoriesList() {
  const { data, isLoading, error } = useVormiaQuery({
    endpoint: "/categories",
    method: "GET",
  });
  // Render logic for Qwik
}
```

---

## Authentication Example (React)

```jsx
import { useVrmAuth } from "vormiaquery";

function LoginForm() {
  const { login, isLoading, error, isAuthenticated } = useVrmAuth({
    endpoint: "/auth/login",
    encryptData: true,
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
import { useVrmMutation } from "vormiaquery";

function AddCategory() {
  const mutation = useVrmMutation({ endpoint: "/categories", method: "POST" });

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
