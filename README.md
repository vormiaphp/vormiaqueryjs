# @vormiajs/vormia-query

A React hooks library for seamless data fetching with TanStack Query and Axios, specifically designed for Laravel/VormiaPHP projects.

## Features

- 🚀 **Easy to use**: Simple API for GET, POST, PUT, DELETE operations
- 🔒 **Built-in Authentication**: Token-based auth with automatic handling
- 🔐 **Data Encryption**: Optional AES encryption for sensitive data
- ⚡ **TanStack Query Integration**: Powerful caching, background updates, and more
- 🎯 **TypeScript Support**: Full type safety out of the box
- 🔄 **Laravel Compatible**: Designed for Laravel API responses
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types

## Installation

```bash
npm install @vormiajs/vormia-query
# or
yarn add @vormiajs/vormia-query
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install react @tanstack/react-query axios
```

## Quick Start

### 1. Setup the Provider

Wrap your app with the `VormiaQueryProvider`:

```tsx
import React from "react";
import { VormiaQueryProvider } from "@vormiajs/vormia-query";

function App() {
  return (
    <VormiaQueryProvider
      config={{
        baseURL: "https://your-api.com/api/v1",
        authTokenKey: "auth_token", // localStorage key for token
        encryptionKey: "your-secret-key", // for data encryption
        onUnauthorized: () => {
          // Handle 401 errors
          window.location.href = "/login";
        },
      }}
    >
      <YourAppComponents />
    </VormiaQueryProvider>
  );
}
```

### 2. Basic Data Fetching

```tsx
import { useVrmQuery } from "@vormiajs/vormia-query";

function CategoriesList() {
  const { data, isLoading, error, refetch } = useVrmQuery({
    endpoint: "/request/list-categories",
    method: "POST",
    queryKey: ["categories"],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.response?.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### 3. Authentication

```tsx
import { useVrmAuth } from "@vormiajs/vormia-query";

function LoginForm() {
  const { login, isLoading, error, isAuthenticated } = useVrmAuth({
    endpoint: "/auth/login",
    encryptData: true, // Encrypt login credentials
    storeToken: true, // Automatically store token
    onLoginSuccess: (data) => {
      console.log("Login successful:", data.user);
    },
  });

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Redirect or update UI
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome back!</div>;
  }

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

### 4. Mutations (Create, Update, Delete)

```tsx
import {
  useVrmMutation,
  useVrmCreate,
  useVrmUpdate,
  useVrmDelete,
} from "@vormiajs/vormia-query";

function CategoryManager() {
  // Generic mutation
  const createCategory = useVrmMutation({
    endpoint: "/categories",
    method: "POST",
    onSuccess: (data) => {
      console.log("Category created:", data);
    },
  });

  // Specialized hooks
  const updateCategory = useVrmUpdate("/categories/{id}");
  const deleteCategory = useVrmDelete("/categories/{id}");

  const handleCreate = async (categoryData) => {
    await createCategory.mutateAsync(categoryData);
  };

  return (
    <div>
      <button onClick={() => handleCreate({ name: "New Category" })}>
        Create Category
      </button>
    </div>
  );
}
```

## API Reference

### VormiaQueryProvider

The main provider component that sets up the Vormia client and TanStack Query.

```tsx
<VormiaQueryProvider
  config={{
    baseURL: string;                    // API base URL
    headers?: Record<string, string>;   // Default headers
    timeout?: number;                   // Request timeout (default: 30000ms)
    withCredentials?: boolean;          // Include credentials (default: false)
    authTokenKey?: string;              // localStorage key for auth token
    encryptionKey?: string;             // Key for data encryption
    onUnauthorized?: () => void;        // 401 error handler
    onError?: (error: VormiaError) => void; // Global error handler
  }}
  queryClient={queryClient} // Optional: provide your own QueryClient
>
```

### useVrmQuery

Hook for data fetching with caching.

```tsx
const result = useVrmQuery({
  endpoint: string;                 // API endpoint
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // HTTP method
  params?: Record<string, any>;     // Query parameters
  data?: any;                       // Request body
  headers?: Record<string, string>; // Additional headers
  transform?: (data: any) => T;     // Transform response data
  onSuccess?: (data) => void;       // Success callback
  onError?: (error) => void;        // Error callback
  // All TanStack Query options...
});
```

### useVrmAuth

Hook for authentication operations.

```tsx
const auth = useVrmAuth({
  endpoint: string;                 // Auth endpoint
  encryptData?: boolean;            // Encrypt request data (default: true)
  storeToken?: boolean;             // Store token automatically (default: true)
  onLoginSuccess?: (data) => void;  // Login success callback
  // Other mutation options...
});

// Methods
auth.login(credentials);     // Login function
auth.logout();              // Logout and clear data
auth.isAuthenticated;       // Authentication status
```

### useVrmMutation

Hook for data mutations (create, update, delete).

```tsx
const mutation = useVrmMutation({
  endpoint: string;                 // API endpoint
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; // HTTP method
  encryptData?: boolean;            // Encrypt request data
  transform?: (data: any) => T;     // Transform response data
  onSuccess?: (data) => void;       // Success callback
  onError?: (error) => void;        // Error callback
  // All TanStack Query mutation options...
});

// Methods
mutation.mutate(data);           // Execute mutation
mutation.mutateAsync(data);      // Execute mutation (async)
mutation.invalidateQueries();    // Invalidate related queries
```

### Specialized Mutation Hooks

```tsx
// Create
const create = useVrmCreate("/endpoint", options);

// Update
const update = useVrmUpdate("/endpoint", options);

// Patch
const patch = useVrmPatch("/endpoint", options);

// Delete
const deleteItem = useVrmDelete("/endpoint", options);
```

### Error Handling

The package includes a comprehensive `VormiaError` class:

```tsx
try {
  await mutation.mutateAsync(data);
} catch (error) {
  if (error.isValidationError()) {
    const validationErrors = error.getValidationErrors();
    // Handle validation errors
  } else if (error.isUnauthorized()) {
    // Handle auth errors
  } else if (error.isServerError()) {
    // Handle server errors
  }
}
```

## Laravel Integration

This package is designed to work seamlessly with Laravel APIs. It handles:

- ✅ Standard Laravel JSON responses
- ✅ Validation error responses (422)
- ✅ Authentication with Sanctum/Passport
- ✅ 204 No Content responses
- ✅ Pagination metadata

Example Laravel response format:

```json
{
  "response": [...], // Your data
  "message": "Success",
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 15
  }
}
```

## Data Encryption

Enable encryption for sensitive data:

```tsx
const { mutate } = useVrmMutation({
  endpoint: "/sensitive-data",
  encryptData: true, // Data will be AES encrypted
});

// Or for auth
const auth = useVrmAuth({
  endpoint: "/login",
  encryptData: true, // Credentials will be encrypted
});
```

## TypeScript Support

Full TypeScript support with proper typing:

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const { data } = useVrmQuery<User[]>({
  endpoint: "/users",
});

const auth = useVrmAuth<User, LoginCredentials>({
  endpoint: "/login",
});
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📖 [Documentation](https://github.com/vormiaphp/vormiaquery/wiki)
- 🐛 [Issues](https://github.com/vormiaphp/vormiaquery/issues)
- 💬 [Discussions](https://github.com/vormiaphp/vormiaquery/discussions)
