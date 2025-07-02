import { createResource } from "solid-js";
import { getGlobalVormiaClient } from "../../client/createVormiaClient";
import { VormiaError } from "../../client/utils/VormiaError";

export function createVormiaResource(options) {
  const client = getGlobalVormiaClient();
  const {
    endpoint,
    method = "GET",
    params,
    data: bodyData,
    headers,
    transform,
    ...resourceOptions
  } = options;

  const fetchData = async () => {
    try {
      const config = {
        method,
        params: method === "GET" ? params : undefined,
        data: method !== "GET" ? bodyData || params : undefined,
        headers,
      };

      const response = await client.request({
        url: endpoint,
        ...config,
      });

      let result = response.data;

      if (transform) {
        result = transform(result);
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      const status = error?.response?.status;
      const errorData = error?.response?.data;

      throw new VormiaError(errorMessage, status, errorData);
    }
  };

  const [resource] = createResource(
    resourceOptions.autoFetch !== false ? fetchData : undefined,
    resourceOptions
  );

  const enhancedRefetch = async (opts = {}) => {
    const mergedOptions = { ...options, ...opts };
    const response = await fetchData(mergedOptions);
    return response;
  };

  return [resource, { ...resource.actions, refetch: enhancedRefetch }];
}
