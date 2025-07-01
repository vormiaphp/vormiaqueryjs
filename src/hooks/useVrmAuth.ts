import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { VormiaAuthOptions, VormiaAuthResponse, VormiaError, VormiaMutationOptions } from '../types';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

// Hook for authenticated queries with encryption
export const useVrmAuthQuery = <T = any>(
  options: VormiaAuthOptions<T>
): UseQueryResult<VormiaAuthResponse<T>, VormiaError> & {
  invalidate: () => Promise<void>;
  logout: () => void;
} => {
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
    onSuccess,
    onError,
    ...queryOptions
  } = options;

  const queryKey = ['auth', endpoint, method, params, data];

  const queryConfig = {
    ...queryOptions,
    queryKey,
  };

  const queryResult = useQuery<VormiaAuthResponse<T>, VormiaError>({
    ...queryConfig,
    queryFn: async (): Promise<VormiaAuthResponse<T>> => {
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

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Authentication failed'
        );

        // Call onError callback
        if (onError) {
          onError(vormiaError);
        }

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
  };
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

  const mutation = useMutation<VormiaAuthResponse<T>, VormiaError, V>({
    mutationFn: async (variables: V): Promise<VormiaAuthResponse<T>> => {
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

        // Call success callbacks
        if (onLoginSuccess) {
          onLoginSuccess(response);
        }
        if (onSuccess) {
          onSuccess(response, variables, undefined);
        }

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Authentication failed'
        );

        // Call onError callback
        if (onError) {
          onError(vormiaError, variables, undefined);
        }

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