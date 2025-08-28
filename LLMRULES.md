# VormiaQueryJS - AI IDE Assistant Rules & Guidelines

## 🎯 **Project Overview for AI IDE Assistants**

VormiaQueryJS is a **framework-agnostic query and mutation library** for JavaScript meta-frameworks. This document provides coding standards, patterns, and rules that AI IDE assistants should follow when helping with this project.

## 🏗️ **Project Architecture Rules**

### **1. Multi-Framework Adapter Pattern**

- **NEVER** hardcode framework-specific code in core modules
- **ALWAYS** use the adapter pattern for framework-specific implementations
- **MAINTAIN** separation between core logic and framework adapters
- **LOCATE** framework code in `src/adapters/[framework]/` directories

### **2. Core Module Rules**

- **KEEP** `src/core/` framework-agnostic
- **USE** `src/client/` for HTTP client utilities
- **MAINTAIN** `src/utils/` for shared utilities
- **AVOID** importing framework-specific libraries in core modules

## 📝 **Coding Standards & Patterns**

### **1. JavaScript/TypeScript Rules**

- **USE** ES6+ syntax and modern JavaScript features
- **PREFER** `const` and `let` over `var`
- **USE** arrow functions for consistency
- **MAINTAIN** consistent naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and components
  - `UPPER_SNAKE_CASE` for constants

### **2. Import/Export Patterns**

```javascript
// ✅ CORRECT: Named exports for utilities
export { VormiaError, createVormiaClient } from './core';

// ✅ CORRECT: Default exports for main classes
export default class VormiaClient { }

// ❌ AVOID: Mixed export styles in same file
export default VormiaClient;
export { VormiaError };
```

### **3. Error Handling Standards**

```javascript
// ✅ CORRECT: Use VormiaError class
import { VormiaError } from "../client/utils/VormiaError";

try {
  // API call
} catch (error) {
  throw new VormiaError(
    error.message || "Request failed",
    error.response?.status,
    error.response?.data,
    error.code
  );
}

// ❌ AVOID: Generic Error instances
throw new Error("Something went wrong");
```

## 🔧 **Configuration & Environment Rules**

### **1. Environment Variable Standards**

```javascript
// ✅ CORRECT: Use VITE_ prefix for Vite projects
const API_URL = import.meta.env.VITE_VORMIA_API_URL;

// ✅ CORRECT: Provide fallbacks
const TIMEOUT = import.meta.env.VITE_VORMIA_TIMEOUT || 30000;

// ❌ AVOID: Hardcoded values
const API_URL = "https://api.example.com";
```

### **2. Debug Mode Implementation**

```javascript
// ✅ CORRECT: Use VITE_VORMIA_DEBUG flag
const isDebugMode = import.meta.env.VITE_VORMIA_DEBUG === "true";

// ✅ CORRECT: Environment-based configuration
const environment = import.meta.env.VITE_VORMIA_ENV || "local";

// ❌ AVOID: Console.log without debug checks
console.log("Debug info"); // Only if debug mode is enabled
```

## 🎨 **UI Component Rules**

### **1. Styling Standards**

```javascript
// ✅ CORRECT: Use external CSS files
import './ComponentName.css';

// ✅ CORRECT: Use Tailwind 4 when appropriate
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">

// ❌ AVOID: Inline styles (user preference)
<div style={{ padding: '1rem', backgroundColor: '#eff6ff' }}>

// ❌ AVOID: Inline styled notification components
<div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
```

### **2. Component Structure**

```javascript
// ✅ CORRECT: Functional components with hooks
export function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  return <div className="component-class">{/* JSX content */}</div>;
}

// ❌ AVOID: Class components (unless required by framework)
```

## 🔄 **State Management Rules**

### **1. Zustand Store Standards**

```javascript
// ✅ CORRECT: Use Zustand for state management
import { create } from "zustand";

export const useStore = create((set, get) => ({
  state: initialState,
  actions: {
    updateState: (newState) => set({ state: newState }),
    resetState: () => set({ state: initialState }),
  },
}));

// ❌ AVOID: Complex state logic in components
```

### **2. Hook Implementation**

```javascript
// ✅ CORRECT: Framework-agnostic hook pattern
export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();

  // Hook logic here
  return { data, isLoading, error };
}

// ❌ AVOID: Framework-specific logic in shared hooks
```

## 🧪 **Testing Standards**

### **1. Test File Organization**

```javascript
// ✅ CORRECT: Test file naming
ComponentName.test.jsx; // React components
ComponentName.test.js; // Core utilities
framework - name.test.js; // Framework adapters

// ✅ CORRECT: Test structure
import { describe, it, expect, beforeEach } from "vitest";

describe("ComponentName", () => {
  beforeEach(() => {
    // Setup
  });

  it("should render correctly", () => {
    // Test logic
  });
});
```

### **2. Testing Patterns**

```javascript
// ✅ CORRECT: Test error scenarios
it("should handle API errors gracefully", async () => {
  // Mock error response
  // Test error handling
  // Verify error state
});

// ✅ CORRECT: Test loading states
it("should show loading state during API calls", () => {
  // Verify loading indicator
  // Check state transitions
});
```

## 📦 **Package Structure Rules**

### **1. File Organization**

```
src/
├── adapters/          # Framework-specific code ONLY
├── core/             # Framework-agnostic core logic
├── client/           # HTTP client and utilities
├── providers/        # Configuration providers
├── stores/           # State management
├── components/       # UI components
├── hooks/            # Shared hooks
└── utils/            # Utility functions
```

### **2. Export Patterns**

```javascript
// ✅ CORRECT: Index files for clean imports
// src/adapters/react/index.js
export { useVormiaQuery } from "./useVormiaQuery";
export { VormiaProvider } from "./VormiaProvider";

// ✅ CORRECT: Main package exports
// src/index.js
export { createVormiaClient, VormiaError } from "./core";
export { useVormiaQuery } from "./adapters/react";
```

## 🚀 **Framework-Specific Rules**

### **1. React Implementation**

```javascript
// ✅ CORRECT: Use React Query integration
import { useQuery } from "@tanstack/react-query";

export function useVormiaQuery(options) {
  return useQuery({
    queryKey: [options.endpoint, options.method],
    queryFn: () => client.request(options),
    // ... other options
  });
}

// ❌ AVOID: Custom state management in React hooks
```

### **2. Vue Implementation**

```javascript
// ✅ CORRECT: Use Vue Query integration
import { useQuery } from "@tanstack/vue-query";

export function useVormia(options) {
  return useQuery({
    queryKey: [options.endpoint],
    queryFn: () => client.request(options),
  });
}
```

### **3. Svelte Implementation**

```javascript
// ✅ CORRECT: Use Svelte stores
import { writable, derived } from "svelte/store";

export function createVormiaStore(options) {
  const store = writable({ data: null, loading: false, error: null });

  // Store logic here

  return store;
}
```

## 🔍 **Debug & Development Rules**

### **1. Debug Component Implementation**

```javascript
// ✅ CORRECT: Conditional debug rendering
export function ErrorDebugPanel({ error, showDebug }) {
  if (!showDebug || !import.meta.env.VITE_VORMIA_DEBUG) {
    return null;
  }

  return <div className="debug-panel">{/* Debug information */}</div>;
}

// ❌ AVOID: Always showing debug information
```

### **2. Logging Standards**

```javascript
// ✅ CORRECT: Environment-aware logging
const log = (message, data) => {
  if (import.meta.env.VITE_VORMIA_DEBUG) {
    console.log(`[VormiaQuery] ${message}`, data);
  }
};

// ❌ AVOID: Unconditional console statements
console.log("Debug info"); // Only in debug mode
```

## 📋 **Code Quality Rules**

### **1. Performance Considerations**

```javascript
// ✅ CORRECT: Memoize expensive operations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ CORRECT: Use callback optimization
const handleClick = useCallback(() => {
  // Click handler logic
}, [dependencies]);

// ❌ AVOID: Unnecessary re-renders
```

### **2. Error Boundaries**

```javascript
// ✅ CORRECT: Implement error boundaries
export function VormiaErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback onReset={() => setHasError(false)} />;
  }

  return children;
}

// ❌ AVOID: Letting errors crash the app
```

## 🚨 **Critical Rules for AI IDE Assistants**

### **1. Framework Detection**

- **ALWAYS** check the user's current framework before suggesting code
- **NEVER** mix framework-specific patterns in the same file
- **CONFIRM** framework choice before implementing features

### **2. Import Paths**

- **USE** correct import paths based on framework
- **VERIFY** export availability before suggesting imports
- **CHECK** package.json exports for valid import paths

### **3. Configuration Requirements**

- **ALWAYS** require `baseURL` for client initialization
- **ENFORCE** environment variable naming conventions
- **VALIDATE** configuration before use

### **4. Error Handling**

- **NEVER** suggest generic Error instances
- **ALWAYS** use VormiaError class for API errors
- **PROVIDE** specific error handling examples

### **5. State Management**

- **PREFER** Zustand for complex state
- **AVOID** mixing state management solutions
- **CONSIDER** framework-specific state patterns

## 🔗 **Reference Files for AI Assistants**

### **Key Files to Understand**

- `package.json` - Dependencies and exports
- `src/core/VormiaClient.js` - Core HTTP client
- `src/adapters/react/useVormiaQuery.js` - React implementation
- `src/providers/VormiaProvider.jsx` - Configuration provider
- `src/stores/` - State management patterns
- `examples/` - Usage examples by framework

### **Configuration Files**

- `vite.config.js` - Build configuration
- `eslint.config.js` - Code quality rules
- `jest.config.js` - Testing configuration

---

**Remember**: This project emphasizes **framework-agnostic design**, **clean separation of concerns**, and **consistent error handling**. Always consider the user's specific framework and maintain the established architectural patterns.
