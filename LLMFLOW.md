# VormiaQueryJS - AI Chat Model Guide

## 🎯 **Package Overview**

VormiaQueryJS is a **framework-agnostic query and mutation library** designed to work with VormiaPHP Laravel backend applications. It provides a unified API for data fetching, error handling, notifications, and debugging across multiple JavaScript frameworks.

## ✅ **Recent Configuration Fixes (v2.0.1)**

### **100% Configuration Compliance Achieved**

As of version 2.0.1, VormiaQueryJS has achieved **100% configuration compliance** with its documentation. All previously missing exports have been resolved:

#### **Fixed Issues**

- ✅ **Route Guard Functions**: `createVormiaRouteGuardVue` and `createVormiaRouteGuardSvelte` now properly exported
- ✅ **Build Configuration**: All dependencies properly externalized (React, zustand, etc.)
- ✅ **React Adapter**: Now exports all 28 documented components, hooks, and utilities
- ✅ **Framework Adapters**: All documented functionality now available across all frameworks

#### **Current Status**

- **Components**: 5/5 ✅ (100% configured)
- **Hooks**: 10/10 ✅ (100% configured)
- **Stores**: 7/7 ✅ (100% configured)
- **Framework Adapters**: 4/4 ✅ (100% configured)
- **Route Guards**: 4/4 ✅ (100% configured)

**Overall Configuration**: **100% Complete** ✅

## 🏗️ **Architecture & Core Concepts**

### **1. Multi-Framework Support**

The package uses **adapter pattern** to support multiple frameworks:

- **React**: Uses `@tanstack/react-query` under the hood
- **Vue**: Integrates with `@tanstack/vue-query`
- **Svelte**: Custom store-based implementation
- **Solid**: Uses `@tanstack/solid-query`
- **Qwik**: Framework-specific adapter
- **Astro**: React-based integration

### **2. Core Components**

#### **VormiaClient (Core HTTP Layer)**

- **Location**: `src/core/VormiaClient.js`
- **Purpose**: Handles all HTTP requests using Axios
- **Key Features**:
  - Automatic authentication token handling
  - Request/response interceptors
  - Error transformation to `VormiaError` instances
  - Environment variable configuration

#### **VormiaProvider (Configuration Provider)**

- **Location**: `src/providers/VormiaProvider.jsx`
- **Purpose**: Provides global configuration and client initialization
- **Key Features**:
  - Sets up global VormiaClient instance
  - Handles initialization state
  - Provides error boundaries for setup failures

#### **Framework Adapters**

- **Location**: `src/adapters/[framework]/`
- **Purpose**: Framework-specific implementations of query hooks
- **Pattern**: Each adapter exports framework-specific hooks that use the core VormiaClient

### **3. State Management Integration**

- **Zustand**: Primary state management solution
- **Stores**: Authentication, caching, settings, and storage management
- **Location**: `src/stores/`

## 🔧 **Key Configuration & Environment Variables**

### **Required Environment Variables**

```bash
VITE_VORMIA_API_URL=https://api.example.com
VITE_VORMIA_AUTH_TOKEN_KEY=auth_token
VITE_VORMIA_TIMEOUT=30000
VITE_VORMIA_WITH_CREDENTIALS=true
```

### **Debug & Environment Flags**

```bash
VITE_VORMIA_DEBUG=true          # Enables debug mode
VITE_VORMIA_ENV=local          # Environment setting (local/production)
```

## 📚 **Usage Patterns & API Design**

### **1. Basic Query Pattern**

```javascript
import { useVormiaQuery } from "vormiaqueryjs/react";

const { data, isLoading, error } = useVormiaQuery({
  endpoint: "/api/users",
  method: "GET",
  params: { page: 1, limit: 10 },
});
```

### **2. Configuration Pattern**

```javascript
import { VormiaProvider } from "vormiaqueryjs/react";

<VormiaProvider
  config={{
    baseURL: "https://api.example.com",
    timeout: 30000,
    withCredentials: true,
  }}
>
  <App />
</VormiaProvider>;
```

### **3. Error Handling Pattern**

```javascript
import { VormiaError } from "vormiaqueryjs";

if (error instanceof VormiaError) {
  if (error.isValidationError()) {
    // Handle validation errors
  }
  if (error.isNetworkError()) {
    // Handle network errors
  }
}
```

## 🎨 **UI Components & Styling**

### **Component Philosophy**

- **No inline styles**: Components use external CSS files
- **Tailwind 4**: Preferred styling solution for new UI projects
- **Framework-agnostic**: Components work across all supported frameworks

### **Available Components**

- **ErrorDebugPanel**: Debug information display
- **NotificationPanel**: User notification system
- **VormiaRouteGuard**: Route protection and authentication

## 🔍 **Debug & Development Features**

### **Debug Mode**

- Controlled by `VITE_VORMIA_DEBUG` environment variable
- Provides detailed error information and request/response logging
- Includes development-specific error panels and notifications

### **Error Handling**

- **VormiaError Class**: Custom error class with utility methods
- **Validation Errors**: Structured field-level error handling
- **Network Errors**: HTTP status code handling
- **User Messages**: Human-readable error messages

## 🚀 **Framework-Specific Implementations**

### **React (Primary)**

```javascript
// Primary hook
import { useVormiaQuery } from "vormiaqueryjs/react";

// Provider component
import { VormiaProvider } from "vormiaqueryjs/react";
```

### **Vue**

```javascript
import { useVormia } from "vormiaqueryjs/vue";
```

### **Svelte**

```javascript
import { vormiaStore } from "vormiaqueryjs/svelte";
```

### **Solid**

```javascript
import { createVormiaResource } from "vormiaqueryjs/solid";
```

## 📦 **Package Structure & Exports**

### **Main Exports (Framework-Agnostic)**

```javascript
// Core functionality - No framework dependencies
import { createVormiaClient, HttpMethod } from "vormiaqueryjs";

// Only framework-agnostic utilities and types
```

### **Framework-Specific Exports**

```javascript
// React-specific functionality
import { useVormiaQuery, VormiaProvider } from "vormiaqueryjs/react";

// Vue-specific functionality
import { useVormia, useVrmAuthEnhancedVue } from "vormiaqueryjs/vue";

// Svelte-specific functionality
import { vormiaStore, useVrmAuthEnhancedSvelte } from "vormiaqueryjs/svelte";

// Solid-specific functionality
import { createVormiaResource } from "vormiaqueryjs/solid";

// Qwik-specific functionality
import { useVormia } from "vormiaqueryjs/qwik";
```

### **File Organization**

```
src/
├── adapters/          # Framework-specific implementations
│   ├── react/         # React hooks, components, and stores
│   ├── vue/           # Vue hooks and utilities
│   ├── svelte/        # Svelte stores and hooks
│   ├── solid/         # Solid.js hooks
│   └── qwik/          # Qwik hooks
├── core/             # Framework-agnostic core logic
├── client/           # HTTP client and utilities
├── providers/        # Configuration providers
├── stores/           # State management (Zustand)
├── components/       # UI components
├── hooks/            # Framework-agnostic hooks
└── utils/            # Utility functions
```

### **Export Strategy**

- **Main Package**: Only exports framework-agnostic utilities and core client
- **Framework Adapters**: Export all framework-specific hooks, components, and stores
- **Dependency Isolation**: Prevents bundlers from resolving unnecessary framework dependencies

## 🔄 **Data Flow & Lifecycle**

### **1. Initialization**

1. `VormiaProvider` creates global VormiaClient
2. Client reads environment variables and configuration
3. Axios instance is configured with interceptors
4. Global client is available to all hooks

### **2. Query Execution**

1. Hook receives query options
2. Options are validated and transformed
3. VormiaClient executes HTTP request
4. Response is processed and returned
5. Errors are transformed to VormiaError instances

### **3. Error Handling**

1. Axios errors are caught
2. Transformed to VormiaError with context
3. Error is passed to React Query for state management
4. UI components can access error details

## 🧪 **Testing & Development**

### **Test Framework**

- **Vitest**: Primary testing framework
- **Testing Library**: Component testing utilities
- **Jest DOM**: DOM testing utilities

### **Test Patterns**

- Unit tests for core functionality
- Component tests for UI elements
- Integration tests for framework adapters

## 📋 **Common Use Cases & Patterns**

### **1. Authentication**

```javascript
// Automatic token handling via interceptors
// Token stored in localStorage with configurable key
// 401 responses trigger optional callback
```

### **2. Caching**

```javascript
// React Query handles caching automatically
// Custom cache stores available via Zustand
// Cache invalidation and management utilities
```

### **3. Form Handling**

```javascript
// Field-level error handling
// Form data transformation utilities
// Validation error display components
```

## 🚨 **Important Notes for AI Models**

### **1. Framework Compatibility**

- Always check which framework the user is using
- Provide framework-specific import examples
- Consider framework-specific patterns and limitations

### **2. Configuration Requirements**

- `baseURL` is required for client initialization
- Environment variables must be prefixed with `VITE_`
- Peer dependencies must be installed separately

### **3. Error Handling**

- Always use `VormiaError` instances for error checking
- Provide specific error handling examples
- Consider validation vs network error differences

### **4. State Management**

- Zustand is the preferred state management solution
- Stores are framework-agnostic
- Consider framework-specific state management patterns

### **5. Debug Mode**

- Use `VITE_VORMIA_DEBUG` for development features
- Debug components provide additional information
- Production builds should disable debug features

## 🔧 **Troubleshooting Common Issues**

### **1. Dependency Resolution Errors**

```bash
# ❌ ERROR: Could not resolve "vue" imported by "vormiaqueryjs"
# ❌ ERROR: Could not resolve "react" imported by "vormiaqueryjs"
```

**Solution**: Use framework-specific import paths:

```javascript
// ✅ CORRECT: React project
import { useVormiaQuery } from "vormiaqueryjs/react";

// ✅ CORRECT: Vue project
import { useVormia } from "vormiaqueryjs/vue";

// ❌ WRONG: Direct import from main package
import { useVormiaQuery } from "vormiaqueryjs"; // Will cause errors!
```

### **2. Missing Exports**

```bash
# ❌ ERROR: Does not provide an export named 'ErrorDebugPanel'
```

**Solution**: Import from the correct framework adapter:

```javascript
// ✅ CORRECT: React components
import { ErrorDebugPanel } from "vormiaqueryjs/react";

// ✅ CORRECT: Vue components
import { useVormia } from "vormiaqueryjs/vue";
```

### **3. Framework Mismatch**

```bash
# ❌ ERROR: React Hook "useVormiaQuery" is called in a non-React component
```

**Solution**: Ensure you're using the correct framework adapter and have the required peer dependencies installed.

### **4. Build Configuration Issues**

```bash
# ❌ ERROR: Module not found: Can't resolve 'zustand'
```

**Solution**: Install required peer dependencies:

```bash
# For React projects
npm install @tanstack/react-query zustand

# For Vue projects
npm install @tanstack/vue-query zustand

# For Svelte projects
npm install @tanstack/svelte-query zustand
```

## 🔗 **Related Documentation**

- **Package.json**: Dependencies and peer requirements
- **README.md**: User-facing documentation
- **Examples/**: Framework-specific usage examples
- **Types/**: TypeScript definitions and interfaces

---

This guide should help AI chat models understand the architecture, patterns, and best practices for working with VormiaQueryJS. Always consider the user's specific framework and use case when providing assistance.
