import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { VormiaMutationOptions, VormiaResponse, VormiaError } from '../types';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

export const useVrmMutation = <T = any, V = any>(
  options: VormiaMutationOptions<T, V>
): UseMutationResult<VormiaResponse<T>, VormiaError, V> & {
  invalidateQueries: (queryKeys?: string[]) => Promise<void>;
} => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'POST',
    headers,
    axiosConfig,
    transform,
    encryptData = false,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const mutation = useMutation<VormiaResponse<T>, VormiaError, V>({
    mutationFn: async (variables: V): Promise<VormiaResponse<T>> => {
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
          case 'DELETE':
            response = await client.delete(endpoint, config);
            break;
          default:
            throw new VormiaError(`Unsupported HTTP method: ${method}`);
        }

        // Transform data if transform function is provided
        if (transform && response.response) {
          response.response = transform(response.response);
        }

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response, variables, undefined);
        }

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Mutation failed'
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

  // Helper function to invalidate related queries
  const invalidateQueries = async (queryKeys?: string[]): Promise<void> => {
    if (queryKeys && queryKeys.length > 0) {
      // Invalidate specific query keys
      await Promise.all(
        queryKeys.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
      );
    } else {
      // Invalidate all queries by default
      await queryClient.invalidateQueries();
    }
  };

  return {
    ...mutation,
    invalidateQueries,
  };
};

// Specialized hooks for common operations

// Create operation
export const useVrmCreate = <T = any, V = any>(
  endpoint: string,
  options?: Omit<VormiaMutationOptions<T, V>, 'endpoint' | 'method'>
) => {
  return useVrmMutation<T, V>({
    endpoint,
    method: 'POST',
    ...options,
  });
};

// Update operation
export const useVrmUpdate = <T = any, V = any>(
  endpoint: string,
  options?: Omit<VormiaMutationOptions<T, V>, 'endpoint' | 'method'>
) => {
  return useVrmMutation<T, V>({
    endpoint,
    method: 'PUT',
    ...options,
  });
};

// Patch operation
export const useVrmPatch = <T = any, V = any>(
  endpoint: string,
  options?: Omit<VormiaMutationOptions<T, V>, 'endpoint' | 'method'>
) => {
  return useVrmMutation<T, V>({
    endpoint,
    method: 'PATCH',
    ...options,
  });
};

// Delete operation
export const useVrmDelete = <T = any>(
  endpoint: string,
  options?: Omit<VormiaMutationOptions<T, any>, 'endpoint' | 'method'>
) => {
  return useVrmMutation<T, { id?: string | number }>({
    endpoint,
    method: 'DELETE',
    ...options,
  });
};