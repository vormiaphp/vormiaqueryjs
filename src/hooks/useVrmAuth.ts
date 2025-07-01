import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseMutationOptions, 
  UseQueryOptions, 
  UseMutationResult 
} from '@tanstack/react-query';
import { VormiaError, VormiaAuthResponse } from '../types';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

// Extended types for auth
interface VormiaAuthOptions<T = any> extends Omit<UseQueryOptions<VormiaAuthResponse<T>, VormiaError>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  axiosConfig?: any;
  transform?: (data: any) => T;
  encryptData?: boolean;
  storeToken?: boolean;
}

interface VormiaMutationOptions<T = any, V = any> extends Omit<UseMutationOptions<VormiaAuthResponse<T>, VormiaError, V>, 'mutationFn'> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  axiosConfig?: any;
  transform?: (data: any) => T;
  encryptData?: boolean;
}

// Hook for authenticated queries with encryption
export const useVrmAuthQuery = <T = any>(
  options: VormiaAuthOptions<T>
) => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'POST',
    params,
    data,
    headers,
    axiosConfig,
    transform,
    encryptData = false,
    storeToken = true,
    ...queryOptions
  } = options;

  const queryKey = ['auth', endpoint, method, params, data];

  const queryConfig = {
    ...queryOptions,
    queryKey,
  };

  const queryResult = useQuery({
    ...queryConfig,
    queryFn: async () => {
      try {
        let response: any;

        const config = {
          ...axiosConfig,
          headers: { ...headers, ...axiosConfig?.headers },
          params: method === 'GET' ? params : undefined,
          encryptData,
        };

        switch (method.toUpperCase()) {
          case 'GET':
            response = await client.get(endpoint, config);
            break;
          case 'POST':
            response = await client.post(endpoint, data || params, config);
            break;
          case 'PUT':
            response = await client.put(endpoint, data || params, config);
            break;
          case 'PATCH':
            response = await client.patch(endpoint, data || params, config);
            break;
          case 'DELETE':
            response = await client.delete(endpoint, config);
            break;
          default:
            throw new VormiaError(`Unsupported HTTP method: ${method}`);
        }

        // Store auth token if provided and storeToken is true
        if (storeToken && response.token) {
          client.setAuthToken(response.token);
        }

        // Transform data if transform function is provided
        if (transform && response.response) {
          response.response = transform(response.response);
        }

        // Success is handled by React Query's onSuccess

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Authentication failed'
        );

        // Error is handled by React Query's onError

        throw vormiaError;
      }
    },
    ...queryOptions,
  });

  // Helper functions
  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const logout = (): void => {
    client.removeAuthToken();
    queryClient.clear();
  };

  return {
    ...queryResult,
    invalidate,
    logout,
  } as const;
};

// Hook for authentication mutations (login, register, etc.)
export const useVrmAuth = <T = any, V = any>(
  options: VormiaMutationOptions<T, V> & {
    encryptData?: boolean;
    storeToken?: boolean;
    onLoginSuccess?: (data: VormiaAuthResponse<T>) => void;
  }
): UseMutationResult<VormiaAuthResponse<T>, VormiaError, V> & {
  login: (credentials: V) => Promise<VormiaAuthResponse<T>>;
  logout: () => void;
  isAuthenticated: boolean;
} => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'POST',
    headers,
    axiosConfig,
    transform,
    encryptData = true, // Default to true for auth
    storeToken = true,
    onLoginSuccess,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const mutation = useMutation({
    mutationFn: async (variables: V) => {
      try {
        let response: any;

        const config = {
          ...axiosConfig,
          headers: { ...headers, ...axiosConfig?.headers },
          encryptData,
        };

        switch (method.toUpperCase()) {
          case 'POST':
            response = await client.post(endpoint, variables, config);
            break;
          case 'PUT':
            response = await client.put(endpoint, variables, config);
            break;
          case 'PATCH':
            response = await client.patch(endpoint, variables, config);
            break;
          default:
            throw new VormiaError(`Unsupported HTTP method for auth: ${method}`);
        }

        // Store auth token if provided and storeToken is true
        if (storeToken && response.token) {
          client.setAuthToken(response.token);
        }

        // Transform data if transform function is provided
        if (transform && response.response) {
          response.response = transform(response.response);
        }

        // Success is handled by React Query's onSuccess

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Authentication failed'
        );

        // Error is handled by React Query's onError

        throw vormiaError;
      }
    },
    ...mutationOptions,
  });

  // Helper functions
  const login = async (credentials: V): Promise<VormiaAuthResponse<T>> => {
    return mutation.mutateAsync(credentials);
  };

  const logout = (): void => {
    client.removeAuthToken();
    queryClient.clear();
  };

  const isAuthenticated = Boolean(client.getAuthToken());

  return {
    ...mutation,
    login,
    logout,
    isAuthenticated,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const client = getGlobalVormiaClient();
  const queryClient = useQueryClient();

  const isAuthenticated = Boolean(client.getAuthToken());
  const token = client.getAuthToken();

  const logout = (): void => {
    client.removeAuthToken();
    queryClient.clear();
  };

  const setToken = (newToken: string): void => {
    client.setAuthToken(newToken);
  };

  return {
    isAuthenticated,
    token,
    logout,
    setToken,
  };
};