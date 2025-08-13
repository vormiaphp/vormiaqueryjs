import { useQuery } from "@tanstack/react-query";
import { getGlobalVormiaClient } from "../../client/createVormiaClient";
import { VormiaError } from "../../client/utils/VormiaError";

// Export VormiaProvider from the React adapter
export { VormiaProvider } from "../../providers/VormiaProvider";

export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();
  const {
    endpoint,
    method = "GET",
    params,
    data: bodyData,
    headers,
    transform,
    enabled = true,
    setEncrypt = false,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, bodyData, headers, setEncrypt];

  const queryFn = async () => {
    try {
      let config = {
        method,
        params: method === "GET" ? params : undefined,
        data: method !== "GET" ? bodyData || params : undefined,
        headers,
      };
      if (setEncrypt && config.data) {
        const { encryptWithPublicKey } = await import(
          "../../client/utils/encryption"
        );
        config.data = encryptWithPublicKey(config.data);
      }
      const response = await client.request({
        url: endpoint,
        ...config,
      });
      let responseData = response.data;
      if (setEncrypt && responseData) {
        const { decryptWithPrivateKey } = await import(
          "../../client/utils/encryption"
        );
        responseData = decryptWithPrivateKey(responseData);
      }
      if (transform) {
        responseData = transform(responseData);
      }
      return responseData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      const status = error?.response?.status;
      const errorData = error?.response?.data;

      throw new VormiaError(errorMessage, status, errorData);
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...queryOptions,
  });
}
