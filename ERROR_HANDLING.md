# Enhanced Error Handling and Response Formatting

This document explains the enhanced error handling and response formatting in VormiaQueryJS.

## Success Response Format

Successful API responses are now formatted for easier access to data:

```javascript
{
  // Direct access to response data
  success: true,
  message: "User registered successfully",
  id: 4,
  name: "John Doe",
  email: "john@example.com",
  
  // Debug info (only in development)
  debug: {
    execution_time: 0.42,
    memory_usage: 7098560
  },
  
  // Response metadata
  status: 200,
  statusText: "OK",
  
  // Original response data structure
  originalData: {
    success: true,
    message: "User registered successfully",
    data: {
      user: { /* ... */ },
      access_token: "...",
      token_type: "Bearer",
      verification_url: "...",
      verification_token: "..."
    },
    debug: { /* ... */ }
  }
}
```

## Error Response Format

Error responses are now more informative and secure:

```javascript
{
  // User-friendly error message
  message: "Email already in use",
  
  // Error details
  status: 422,
  code: "VALIDATION_ERROR",
  
  // Debug info (only in development)
  debug: {
    execution_time: 0.23,
    memory_usage: 6054321,
    trace: [/* filtered stack trace */]
  },
  
  // Filtered response data (sensitive data removed)
  response: {
    data: {
      message: "The given data was invalid.",
      errors: {
        email: ["The email has already been taken."]
      }
    },
    status: 422,
    statusText: "Unprocessable Entity"
  }
}
```

## Sensitive Data Filtering

By default, the following keys are filtered from error responses and debug information:

- `access_token`
- `token`
- `token_type`
- `verification_token`
- `password`
- `password_confirmation`
- `api_key`
- `secret`
- `private_key`
- `authorization`

### Customizing Sensitive Keys

You can customize the list of sensitive keys when creating the client:

```javascript
import { createVormiaClient } from 'vormiaqueryjs';

const client = createVormiaClient({
  baseURL: 'https://api.example.com',
  sensitiveKeys: [
    'custom_sensitive_key',
    'another_sensitive_field'
  ]
});
```

## Error Handling Examples

### Handling Success Responses

```javascript
try {
  const response = await client.post('/api/register', userData);
  
  // Access response data directly
  console.log('User ID:', response.data.id);
  console.log('Name:', response.data.name);
  
  // Access original response structure if needed
  const accessToken = response.data.originalData.data.access_token;
  
} catch (error) {
  // Handle error
}
```

### Handling Errors

```javascript
try {
  await client.post('/api/register', userData);
} catch (error) {
  if (error instanceof VormiaError) {
    // Show user-friendly message
    console.error(error.message);
    
    // Access error details
    if (error.status === 422) {
      console.error('Validation errors:', error.response.data.errors);
    }
    
    // Access debug info in development
    if (process.env.NODE_ENV !== 'production' && error.debug) {
      console.error('Debug info:', error.debug);
    }
  } else {
    // Handle non-Vormia errors
    console.error('An unexpected error occurred:', error);
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filterSensitiveData` | boolean | `true` | Whether to filter sensitive data from error responses |
| `sensitiveKeys` | string[] | `[...DEFAULT_SENSITIVE_KEYS]` | Custom list of sensitive keys to filter |
| `includeDebugInfo` | boolean | `process.env.NODE_ENV !== 'production'` | Whether to include debug info in responses |

## Best Practices

1. **Always check for `VormiaError`** - This ensures you're handling API errors consistently.

2. **Use user-friendly messages** - The `message` property is designed to be shown to users.

3. **Access sensitive data safely** - Always access sensitive data through the `originalData` property.

4. **Enable debug info in development** - This provides valuable information for debugging.

5. **Filter sensitive data in production** - Ensure sensitive data is never exposed in error logs or client-side code.
