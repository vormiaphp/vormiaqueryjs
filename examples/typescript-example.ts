// TypeScript example for VormiaQueryJS
// This file demonstrates how to use the library with full TypeScript support

import { 
  useVormiaQuery, 
  VormiaConfig, 
  VormiaError, 
  createVormiaClient,
  HttpMethod,
  VormiaQueryOptions 
} from 'vormiaqueryjs';

// Example configuration with proper typing
const config: VormiaConfig = {
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-token-here'
  },
  withCredentials: true,
  debug: process.env.NODE_ENV === 'development'
};

// Example client creation
const client = createVormiaClient(config);

// Example query options with proper typing
const userQueryOptions: VormiaQueryOptions = {
  endpoint: '/api/users',
  method: HttpMethod.GET,
  params: { 
    page: 1, 
    limit: 10,
    search: 'john'
  },
  showDebug: true,
  enabled: true,
  refetchOnWindowFocus: false,
  retry: 3,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000    // 10 minutes
};

// Example React component usage (this would be in a .tsx file)
/*
import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useVormiaQuery<User[]>(userQueryOptions);

  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    if (error instanceof VormiaError) {
      return (
        <div>
          <h3>Error: {error.getUserMessage()}</h3>
          {error.isValidationError() && (
            <div>Validation errors: {JSON.stringify(error.getValidationErrors())}</div>
          )}
          {error.isNetworkError() && (
            <div>Network error occurred. Please check your connection.</div>
          )}
        </div>
      );
    }
    return <div>An unexpected error occurred</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.data?.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
*/

// Example error handling
function handleApiError(error: unknown): string {
  if (error instanceof VormiaError) {
    // Use the built-in error utility methods
    if (error.isValidationError()) {
      const validationErrors = error.getValidationErrors();
      return `Validation failed: ${JSON.stringify(validationErrors)}`;
    }
    
    if (error.isNetworkError()) {
      return 'Network error: Please check your internet connection';
    }
    
    if (error.isServerError()) {
      return 'Server error: Please try again later';
    }
    
    if (error.isUnauthenticated()) {
      return 'Authentication required: Please log in';
    }
    
    if (error.isUnauthorized()) {
      return 'Access denied: You don\'t have permission for this action';
    }
    
    // Return user-friendly message
    return error.getUserMessage();
  }
  
  // Handle other types of errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

// Example mutation usage
/*
import { useVrmMutation } from 'vormiaqueryjs/react';

const CreateUser: React.FC = () => {
  const mutation = useVrmMutation({
    endpoint: '/api/users',
    method: HttpMethod.POST,
    showDebug: true,
    onSuccess: (data) => {
      console.log('User created:', data);
    },
    onError: (error) => {
      console.error('Failed to create user:', handleApiError(error));
    }
  });

  const handleSubmit = (userData: Partial<User>) => {
    mutation.mutate(userData);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ name: 'John Doe', email: 'john@example.com' });
    }}>
      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Creating...' : 'Create User'}
      </button>
      {mutation.error && (
        <div className="error">{handleApiError(mutation.error)}</div>
      )}
    </form>
  );
};
*/

console.log('TypeScript types are working correctly!');
console.log('You can now use this library with full type safety.');

// Export for use in other files
export {
  config,
  client,
  userQueryOptions,
  handleApiError
};
