# TypeScript Types for VormiaQueryJS

This directory contains TypeScript declaration files for the VormiaQueryJS library.

## Main Declaration File

- `vormiaqueryjs.d.ts` - Main type definitions for the entire library

## Usage

After building the project, the types will be available in the `dist/types/` directory and will be automatically included when you import from `vormiaqueryjs`.

### Example

```typescript
import { useVormiaQuery, VormiaConfig, VormiaError } from "vormiaqueryjs";

// TypeScript will now provide full type support
const { data, isLoading, error } = useVormiaQuery({
  endpoint: "/api/users",
  method: "GET",
});

// Error handling with proper types
if (error instanceof VormiaError) {
  console.log(error.getUserMessage());
  console.log(error.isValidationError());
}
```

## Available Types

### Core Types

- `VormiaConfig` - Configuration interface for the client
- `VormiaQueryOptions` - Options for query hooks
- `VormiaMutationOptions` - Options for mutation hooks
- `VormiaAuthOptions` - Options for authentication hooks
- `VormiaResponse<T>` - Generic response interface
- `VormiaAuthResponse` - Authentication response interface
- `HttpMethod` - Union type of HTTP methods

### Error Types

- `VormiaError` - Custom error class with utility methods

### Hook Types

- `VormiaQueryResult<T>` - Result interface for query hooks
- Various hook function signatures with proper typing

### Component Types

- `VormiaProviderProps` - Props for the VormiaProvider component

## Building

The types are automatically copied to the `dist/types/` directory during the build process. Make sure to run:

```bash
npm run build
```

## Troubleshooting

If you still get TypeScript errors:

1. Make sure you've built the project (`npm run build`)
2. Check that the `types` field in package.json points to the correct location
3. Restart your TypeScript language server
4. Clear your node_modules and reinstall if necessary
