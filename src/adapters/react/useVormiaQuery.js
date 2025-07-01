import { useQuery } from '@tanstack/react-query';
import { getGlobalVormiaClient } from '../../client/createVormiaClient';
import { VormiaError } from '../../client/utils/VormiaError';

export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();
  const {
    endpoint,
    method = 'GET',
    params,
    data: bodyData,
    headers,
    transform,
    enabled = true,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, bodyData, headers];

  const queryFn = async () => {
    try {
      const config = {
        method,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? (bodyData || params) : undefined,
        headers
      };

      const response = await client.request({
        url: endpoint,
        ...config
      });

      if (transform) {
        response.data = transform(response.data);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const status = error?.response?.status;
      const errorData = error?.response?.data;
      
      throw new VormiaError(
        errorMessage,
        status,
        errorData
      );
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...queryOptions
  });
}
