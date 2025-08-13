import { useSignal, useTask$ } from "@builder.io/qwik";
import { getGlobalVormiaClient, VormiaError } from "../../core/VormiaClient";

export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();
  const data = useSignal(null);
  const error = useSignal(null);
  const isLoading = useSignal(false);
  const isError = useSignal(false);
  const isSuccess = useSignal(false);

  const fetchData = async (opts = {}) => {
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
    } = mergedOptions;

    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
      let config = {
        method,
        url: endpoint,
        params: method === "GET" ? params : undefined,
        data: method !== "GET" ? bodyData || params : undefined,
        headers,
      };

      const response = await client.request(config);
      let result = response.data;

      if (transform && result?.response) {
        result.response = transform(result.response);
      }
      data.value = result.response;
      isSuccess.value = true;
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
      error.value = vormiaError;
      isError.value = true;
      if (onError) {
        onError(vormiaError);
      }
      throw vormiaError;
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-fetch if enabled
  useTask$(async () => {
    if (options.enabled !== false) {
      await fetchData();
    }
  });

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

export function useVormiaMutation(options = {}) {
  const client = getGlobalVormiaClient();
  const data = useSignal(null);
  const error = useSignal(null);
  const isLoading = useSignal(false);
  const isError = useSignal(false);
  const isSuccess = useSignal(false);

  const mutate = async (endpoint, values, method = "POST", config = {}) => {
    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
      const response = await client.request({
        method,
        url: endpoint,
        data: values,
        ...config,
      });

      data.value = response.data;
      isSuccess.value = true;

      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const vormiaError =
        err instanceof VormiaError
          ? err
          : new VormiaError(
              err?.message || "An unknown error occurred",
              err?.response?.status
            );

      error.value = vormiaError;
      isError.value = true;

      if (options.onError) {
        options.onError(vormiaError);
      }

      throw vormiaError;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    mutate,
  };
}
