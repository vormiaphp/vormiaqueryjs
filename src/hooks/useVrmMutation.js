import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../client/createVormiaClient";
import { transformFormData } from "../utils/formDataTransformer.js";

/**
 * Hook for making API mutations with Vormia
 * @param {Object} options - Mutation options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {Object} [options.formdata] - Form data transformation configuration
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Mutation result and utilities
 */
export const useVrmMutation = (options) => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = "POST",
    headers,
    transform,
    formdata,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const mutation = useMutation({
    mutationFn: async (variables) => {
      try {
        // Transform form data if configuration is provided
        const transformedData = formdata
          ? transformFormData(variables, formdata)
          : variables;

        const config = {
          method,
          url: endpoint,
          data: transformedData,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        };

        const response = await client.request(config);

        if (transform && typeof transform === "function") {
          return {
            ...response,
            data: transform(response.data),
          };
        }

        return response;
      } catch (error) {
        throw error instanceof Error ? error : new Error("Mutation failed");
      }
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  // Add invalidateQueries utility
  const invalidateQueries = (queryKeys = [endpoint]) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys,
    });
  };

  return {
    ...mutation,
    invalidateQueries,
  };
};

// Specialized hooks for common operations

/**
 * Hook for create operations
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const useVrmCreate = (endpoint, options = {}) => {
  return useVrmMutation({
    endpoint,
    method: "POST",
    ...options,
  });
};

/**
 * Hook for update operations (PUT)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const useVrmUpdate = (endpoint, options = {}) => {
  return useVrmMutation({
    endpoint,
    method: "PUT",
    ...options,
  });
};

/**
 * Hook for partial update operations (PATCH)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const useVrmPatch = (endpoint, options = {}) => {
  return useVrmMutation({
    endpoint,
    method: "PATCH",
    ...options,
  });
};

/**
 * Hook for delete operations
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const useVrmDelete = (endpoint, options = {}) => {
  return useVrmMutation({
    endpoint,
    method: "DELETE",
    ...options,
  });
};
