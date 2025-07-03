import { getGlobalVormiaClient, VormiaError } from "../../core/VormiaClient";
import { useState, useEffect, useCallback } from "react";

export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchData = useCallback(
    async (opts = {}) => {
      const mergedOptions = { ...options, ...opts };
      const {
        endpoint,
        method = "GET",
        params,
        data: bodyData,
        headers,
        transform,
        onSuccess,
        onError,
        setEncrypt = false,
      } = mergedOptions;
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      try {
        let config = {
          method,
          url: endpoint,
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
        const response = await client.request(config);
        let result = response.data;
        if (setEncrypt && result) {
          const { decryptWithPrivateKey } = await import(
            "../../client/utils/encryption"
          );
          result = decryptWithPrivateKey(result);
        }
        if (transform && result?.response) {
          result.response = transform(result.response);
        }
        setData(result.response);
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (err) {
        const vormiaError =
          err instanceof VormiaError
            ? err
            : new VormiaError(
                err?.message || "An unknown error occurred",
                err?.response?.status
              );
        setError(vormiaError);
        setIsError(true);
        if (onError) {
          onError(vormiaError);
        }
        throw vormiaError;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    fetch: fetchData,
    refetch: fetchData,
  };
}
