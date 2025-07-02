import { useQuery, useMutation } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";

/**
 * Hook for authenticated queries with encryption
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.data] - Request body
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {boolean} [options.encryptData=false] - Whether to encrypt the request data
 * @param {boolean} [options.storeToken=true] - Whether to store the auth token
 * @returns {Object} Query result
 */
export const useVrmAuthQuery = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "GET",
    params,
    data,
    headers = {},
    transform,
    encryptData = false,
    storeToken = true,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, data];

  const queryFn = async () => {
    try {
      const config = {
        method,
        url: endpoint,
        params: method === "GET" ? params : undefined,
        data: method !== "GET" ? data : undefined,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        encryptData,
      };

      const response = await client.request(config);

      // Store token if present in response
      if (storeToken && response.data?.token) {
        client.setAuthToken(response.data.token);
      }

      if (transform && typeof transform === "function") {
        return {
          ...response,
          data: transform(response.data),
        };
      }

      return response;
    } catch (error) {
      // Clear token on 401
      if (error.status === 401) {
        client.removeAuthToken();
      }
      throw error instanceof Error
        ? error
        : new Error("Authentication query failed");
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    retry: (failureCount, error) => {
      // Don't retry on 401
      if (error.status === 401) return false;
      return failureCount < 3; // Retry up to 3 times
    },
    ...queryOptions,
  });
};

/**
 * Hook for authentication mutations (login, register, etc.)
 * @param {Object} options - Mutation options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {boolean} [options.encryptData=false] - Whether to encrypt the request data
 * @param {boolean} [options.storeToken=true] - Whether to store the auth token
 * @param {Function} [options.onLoginSuccess] - Callback on successful login
 * @returns {Object} Mutation result and auth utilities
 */
export const useVrmAuth = (options) => {
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "POST",
    headers = {},
    transform,
    encryptData = false,
    storeToken = true,
    onLoginSuccess,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const mutation = useMutation({
    mutationFn: async (variables) => {
      try {
        const config = {
          method,
          url: endpoint,
          data: variables,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          encryptData,
        };

        const response = await client.request(config);

        // Store token if present in response
        if (storeToken && response.data?.token) {
          client.setAuthToken(response.data.token);
        }

        if (transform && typeof transform === "function") {
          return {
            ...response,
            data: transform(response.data),
          };
        }

        return response;
      } catch (error) {
        // Clear token on 401
        if (error.status === 401) {
          client.removeAuthToken();
        }
        throw error instanceof Error
          ? error
          : new Error("Authentication failed");
      }
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
      if (onLoginSuccess && data.data?.token) {
        onLoginSuccess(data);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  // Login helper
  const login = async (credentials) => {
    return mutation.mutateAsync(credentials);
  };

  // Logout helper
  const logout = () => {
    client.removeAuthToken();
  };

  // Check if user is authenticated
  const isAuthenticated = !!client.getAuthToken();

  return {
    ...mutation,
    login,
    logout,
    isAuthenticated,
  };
};

/**
 * Hook for checking authentication status
 * @returns {Object} Authentication status
 */
export const useAuthStatus = () => {
  const client = getGlobalVormiaClient();
  const isAuthenticated = !!client.getAuthToken();

  return {
    isAuthenticated,
    isLoading: false,
  };
};
